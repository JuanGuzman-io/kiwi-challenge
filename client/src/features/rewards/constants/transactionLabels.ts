/**
 * Transaction type label mappings
 * Per FR-010, A-005: Support Cashback, Referral bonus, Withdrawal, Income types
 * Backend type enum → frontend display label
 */

import type { TransactionType } from '../types/rewards.types';

export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  CASHBACK: 'Cashback',
  REFERRAL_BONUS: 'Referral bonus',
  WITHDRAWAL: 'Withdrawal',
  INCOME: 'Income',
} as const;
