import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { WithdrawalResponseDto } from './dto/withdrawal-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { InsufficientFundsException } from '../common/exceptions/insufficient-funds.exception';
import { MinimumAmountException } from '../common/exceptions/minimum-amount.exception';
import { BankAccountNotFoundException } from '../common/exceptions/bank-account-not-found.exception';
import { Prisma, TransactionType, WithdrawalStatus } from '@prisma/client';

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger(WithdrawalsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, createWithdrawalDto: CreateWithdrawalDto): Promise<WithdrawalResponseDto> {
    const { amount, bankAccountId, currency } = createWithdrawalDto;

    const MIN_AMOUNT = 1.0;
    if (amount < MIN_AMOUNT) {
      this.logger.warn(`Withdrawal amount below minimum: ${amount}`);
      throw new MinimumAmountException(MIN_AMOUNT, amount);
    }

    // Run interactive transaction with Serializable isolation
    const txPromise = this.prisma.$transaction(async (tx) => {
      // Lock bank account row (SELECT FOR UPDATE)
      const raw: any = await tx.$queryRawUnsafe(
        'SELECT id, "userId" FROM "bank_accounts" WHERE id = $1 FOR UPDATE',
        bankAccountId,
      );

      if (!raw || raw.length === 0) {
        this.logger.warn(`Bank account not found: ${bankAccountId}`);
        throw new BankAccountNotFoundException(bankAccountId);
      }

      const bankRow: any = raw[0];
      if (bankRow.userId !== userId) {
        this.logger.warn(`Bank account ${bankAccountId} does not belong to user ${userId}`);
        throw new BankAccountNotFoundException(bankAccountId);
      }

      // Calculate balance (credits - debits)
      const credits = await tx.rewardTransaction.aggregate({
        where: {
          userId,
          type: { in: [TransactionType.CASHBACK, TransactionType.REFERRAL_BONUS, TransactionType.INCOME] },
        },
        _sum: { amount: true },
      });

      const debits = await tx.rewardTransaction.aggregate({
        where: { userId, type: TransactionType.WITHDRAWAL },
        _sum: { amount: true },
      });

      const creditSum = credits._sum.amount ? Number(credits._sum.amount.toString()) : 0;
      const debitSum = debits._sum.amount ? Number(debits._sum.amount.toString()) : 0;
      const balance = Number((creditSum - debitSum).toFixed(2));

      if (balance < amount) {
        this.logger.warn(`Insufficient funds for user ${userId}: balance=${balance}, requested=${amount}`);
        throw new InsufficientFundsException(balance, amount);
      }

      // Create withdrawal record
      const created = await tx.withdrawal.create({
        data: {
          userId,
          amount: new Prisma.Decimal(amount.toFixed(2)),
          bankAccountId,
          status: WithdrawalStatus.COMPLETED,
        },
      });

      // Create ledger transaction (negative amount)
      await tx.rewardTransaction.create({
        data: {
          userId,
          type: TransactionType.WITHDRAWAL,
          amount: new Prisma.Decimal((-Math.abs(amount)).toFixed(2)),
          description: `Withdrawal ${created.id}`,
          withdrawalId: created.id,
        },
      });

      return created;
    }, { isolationLevel: 'Serializable' as any });

    // Add a timeout wrapper (5 seconds)
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction timeout')), 5000));

    const createdWithdrawal = await Promise.race([txPromise, timeout]);

    this.logger.log(`Withdrawal processed for user ${userId}, id=${(createdWithdrawal as any).id}`);

    return {
      id: (createdWithdrawal as any).id,
      userId,
      amount,
      bankAccountId,
      currency: currency || 'USD',
      status: 'completed',
      createdAt: (createdWithdrawal as any).createdAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  async findOne(id: string): Promise<WithdrawalResponseDto> {
    const w = await this.prisma.withdrawal.findUnique({ where: { id } });
    if (!w) throw new NotFoundException('Withdrawal not found');

    return {
      id: w.id,
      userId: w.userId,
      amount: Number(w.amount.toString()),
      bankAccountId: w.bankAccountId,
      currency: 'USD',
      status: w.status,
      createdAt: w.createdAt.toISOString(),
    };
  }
}
