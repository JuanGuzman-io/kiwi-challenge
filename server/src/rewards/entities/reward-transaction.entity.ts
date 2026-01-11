export class RewardTransactionEntity {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  withdrawalId?: string | null;
  createdAt: string;
  updatedAt: string;
}
