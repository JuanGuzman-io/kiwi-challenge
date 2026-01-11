export class WithdrawalEntity {
  id: string;
  userId: string;
  amount: number;
  bankAccountId: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
  updatedAt: string;
}
