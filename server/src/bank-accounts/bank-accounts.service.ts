import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BankAccountDto } from './dto/bank-account.dto';

@Injectable()
export class BankAccountsService {
  private readonly logger = new Logger(BankAccountsService.name);

  constructor(private prisma: PrismaService) {}

  private maskAccountNumber(accountNumber?: string, lastFour?: string) {
    if (lastFour) return lastFour;
    if (!accountNumber) return 'xxxx';
    return accountNumber.slice(-4);
  }

  async findAllByUserId(userId: string) {
    this.logger.log(`Fetching bank accounts for user ${userId}`);

    const rows = await this.prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const accounts: BankAccountDto[] = rows.map((r: any) => ({
      id: r.id,
      lastFourDigits: this.maskAccountNumber(r.accountNumber, r.lastFourDigits),
      accountType: r.accountType,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
    }));

    return { accounts, count: accounts.length };
  }
}
