import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RewardsSummaryDto } from './dto/rewards-summary.dto';
import { PaginatedTransactionsDto } from './dto/paginated-transactions.dto';
import { TransactionDto } from './dto/transaction.dto';
import { Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(private prisma: PrismaService) {}

  async calculateBalance(userId: string): Promise<RewardsSummaryDto> {
    // Sum of credit types
    const credits = await this.prisma.rewardTransaction.aggregate({
      where: {
        userId,
        type: { in: [TransactionType.CASHBACK, TransactionType.REFERRAL_BONUS, TransactionType.INCOME] },
      },
      _sum: { amount: true },
    });

    // Sum of debits (withdrawals)
    const debits = await this.prisma.rewardTransaction.aggregate({
      where: { userId, type: TransactionType.WITHDRAWAL },
      _sum: { amount: true },
    });

    const creditSum = credits._sum.amount ? Number(credits._sum.amount.toString()) : 0;
    const debitSum = debits._sum.amount ? Number(debits._sum.amount.toString()) : 0;

    const balance = Number((creditSum - debitSum).toFixed(2));

    this.logger.log(`Calculated balance for user ${userId}: ${balance}`);

    return { balance, currency: 'USD' };
  }

  async getTransactionHistory(userId: string, limit = 20, cursor?: string): Promise<PaginatedTransactionsDto> {
    const take = Math.min(limit, 100);
    const findArgs: any = {
      where: { userId },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      take: take + 1,
    };

    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1;
    }

    const rows = await this.prisma.rewardTransaction.findMany(findArgs);

    const hasMore = rows.length > take;
    const items = hasMore ? rows.slice(0, take) : rows;

    const transactions: TransactionDto[] = items.map((r: any) => ({
      id: r.id,
      type: r.type,
      amount: Number(r.amount.toString()),
      description: r.description,
      createdAt: r.createdAt.toISOString(),
    }));

    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      transactions,
      nextCursor,
      hasMore,
      count: transactions.length,
    };
  }

  async createIncomeTransaction(userId: string, amount: number, description?: string) {
    const MIN_AMOUNT = 0.01;
    if (amount < MIN_AMOUNT) {
      this.logger.warn(`Income amount below minimum: ${amount}`);
      throw new Error('Minimum amount not met');
    }

    const desc = `${description || 'Manual test top-up'} [MANUAL_TEST_TOPUP]`;

    const created = await this.prisma.rewardTransaction.create({
      data: {
        userId,
        type: TransactionType.INCOME,
        amount: new Prisma.Decimal(amount.toFixed(2)),
        description: desc,
      },
    });

    this.logger.log(`Created INCOME transaction ${created.id} for user ${userId} amount=${amount}`);

    return {
      id: created.id,
      userId: created.userId,
      amount: Number(created.amount.toString()),
      description: created.description,
      createdAt: created.createdAt.toISOString(),
    };
  }
}
