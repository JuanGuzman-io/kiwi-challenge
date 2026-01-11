import { WithdrawalsService } from '../../src/withdrawals/withdrawals.service';
import { InsufficientFundsException } from '../../src/common/exceptions/insufficient-funds.exception';
import { MinimumAmountException } from '../../src/common/exceptions/minimum-amount.exception';
import { BankAccountNotFoundException } from '../../src/common/exceptions/bank-account-not-found.exception';

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;

  const txMock: any = {
    $queryRawUnsafe: jest.fn(),
    rewardTransaction: {
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    withdrawal: {
      create: jest.fn(),
    },
  };

  const prismaMock: any = {
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(txMock));
    service = new WithdrawalsService(prismaMock as any);
  });

  it('processes a withdrawal successfully', async () => {
    const amount = 50;
    txMock.$queryRawUnsafe.mockResolvedValue([{ id: 'ba-1', userId: 'user-1' }]);
    txMock.rewardTransaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: { toString: () => '200.00' } } })
      .mockResolvedValueOnce({ _sum: { amount: { toString: () => '50.00' } } });
    txMock.withdrawal.create.mockResolvedValue({ id: 'w-1', createdAt: new Date() });
    txMock.rewardTransaction.create.mockResolvedValue({ id: 'rt-1' });

    const res = await service.create('user-1', { amount, bankAccountId: 'ba-1' } as any);

    expect(res).toHaveProperty('id');
    expect(res.amount).toBe(amount);
  });

  it('throws MinimumAmountException for amounts below minimum', async () => {
    await expect(service.create('u1', { amount: 0.5, bankAccountId: 'ba' } as any)).rejects.toBeInstanceOf(MinimumAmountException);
  });

  it('throws InsufficientFundsException when balance insufficient', async () => {
    txMock.$queryRawUnsafe.mockResolvedValue([{ id: 'ba-1', userId: 'user-1' }]);
    txMock.rewardTransaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: { toString: () => '10.00' } } })
      .mockResolvedValueOnce({ _sum: { amount: null } });

    await expect(service.create('user-1', { amount: 100, bankAccountId: 'ba-1' } as any)).rejects.toBeInstanceOf(InsufficientFundsException);
  });

  it('throws BankAccountNotFoundException when bank account missing', async () => {
    txMock.$queryRawUnsafe.mockResolvedValue([]);

    await expect(service.create('user-1', { amount: 10, bankAccountId: 'missing' } as any)).rejects.toBeInstanceOf(BankAccountNotFoundException);
  });
});
