import { BankAccountsService } from '../../src/bank-accounts/bank-accounts.service';

describe('BankAccountsService', () => {
  let service: BankAccountsService;

  const prismaMock: any = {
    bankAccount: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BankAccountsService(prismaMock as any);
  });

  it('returns masked last 4 digits and count', async () => {
    prismaMock.bankAccount.findMany.mockResolvedValue([
      { id: 'ba-1', accountNumber: '0000111122223333', lastFourDigits: null, accountType: 'checking', isActive: true, createdAt: new Date() },
      { id: 'ba-2', lastFourDigits: '4444', accountType: 'savings', isActive: true, createdAt: new Date() },
    ]);

    const res = await service.findAllByUserId('user-1');

    expect(res.count).toBe(2);
    expect(res.accounts[0].lastFourDigits).toBe('3333');
    expect(res.accounts[1].lastFourDigits).toBe('4444');
  });

  it('returns empty array when no accounts', async () => {
    prismaMock.bankAccount.findMany.mockResolvedValue([]);
    const res = await service.findAllByUserId('user-x');
    expect(res.count).toBe(0);
    expect(res.accounts).toEqual([]);
  });

  it('queries active accounts by user id ordered by createdAt desc', async () => {
    prismaMock.bankAccount.findMany.mockResolvedValue([]);

    await service.findAllByUserId('user-99');

    expect(prismaMock.bankAccount.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-99', isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  });
});
