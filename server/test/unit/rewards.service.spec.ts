import { RewardsService } from '../../src/rewards/rewards.service';

describe('RewardsService', () => {
  let service: RewardsService;
  const prismaMock: any = {
    rewardTransaction: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    service = new RewardsService(prismaMock as any);
    jest.clearAllMocks();
  });

  it('calculateBalance returns sum of credits plus negative debits', async () => {
    // credits aggregate
    prismaMock.rewardTransaction.aggregate.mockImplementationOnce(async () => ({ _sum: { amount: { toString: () => '300.00' } } }));
    // debits aggregate
    prismaMock.rewardTransaction.aggregate.mockImplementationOnce(async () => ({ _sum: { amount: { toString: () => '-120.50' } } }));

    const result = await service.calculateBalance('user-1');

    expect(result.balance).toBeCloseTo(179.5);
    expect(result.currency).toBe('USD');
  });

  it('calculateBalance returns 0 for user with no transactions', async () => {
    prismaMock.rewardTransaction.aggregate.mockImplementation(async () => ({ _sum: { amount: null } }));

    const result = await service.calculateBalance('user-none');

    expect(result.balance).toBe(0);
  });

  it('getTransactionHistory returns paginated results and hasMore flag', async () => {
    const rows = Array.from({ length: 6 }).map((_, i) => ({
      id: `id-${i}`,
      type: 'CASHBACK',
      amount: { toString: () => `${10 + i}.00` },
      description: `desc-${i}`,
      createdAt: new Date(),
    }));

    prismaMock.rewardTransaction.findMany.mockResolvedValue(rows);

    const res = await service.getTransactionHistory('user-1', 5);

    expect(res.transactions.length).toBe(5);
    expect(res.hasMore).toBe(true);
    expect(res.nextCursor).toBeDefined();
  });
});
