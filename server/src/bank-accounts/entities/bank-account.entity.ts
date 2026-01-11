export class BankAccountEntity {
  id: string;
  userId: string;
  accountNumber?: string;
  lastFourDigits?: string;
  accountType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
