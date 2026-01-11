/**
 * Transaction type label mappings
 * Per FR-010, A-005: Support Cashback, Referral bonus, Withdrawal, Income types
 * Backend type enum → frontend display label
 */

import type { TransactionType } from '../types/rewards.types';

export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  CASHBACK: 'Cashback',
  REFERRAL_BONUS: 'Bono de referido',
  WITHDRAWAL: 'Retiro de cuenta',
  INCOME: 'Income',
  ATH: 'Retiro de ATH Móvil'
} as const;
