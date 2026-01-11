/**
 * Type guards for runtime validation of API responses
 * Based on data-model.md validation rules from 001-rewards-home spec
 */

import type { Transaction, RewardsSummary } from '../types/rewards.types';
import type { PaginatedTransactions } from '../types/api.types';

/**
 * Type guard for Transaction
 * Validates that an object matches the Transaction interface
 */
export function isValidTransaction(obj: unknown): obj is Transaction {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    record.id.length > 0 &&
    ['CASHBACK', 'REFERRAL_BONUS', 'WITHDRAWAL', 'INCOME'].includes(record.type as string) &&
    typeof record.amount === 'number' &&
    record.amount !== 0 &&
    typeof record.description === 'string' &&
    typeof record.createdAt === 'string' &&
    !isNaN(Date.parse(record.createdAt))
  );
}

/**
 * Type guard for RewardsSummary
 * Validates that an object matches the RewardsSummary interface
 */
export function isValidRewardsSummary(obj: unknown): obj is RewardsSummary {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  return (
    typeof record.balance === 'number' &&
    record.balance >= 0 &&
    typeof record.currency === 'string' &&
    record.currency.length === 3 &&
    record.currency === record.currency.toUpperCase()
  );
}

/**
 * Type guard for PaginatedTransactions
 * Validates that an object matches the PaginatedTransactions interface
 */
export function isValidPaginatedTransactions(obj: unknown): obj is PaginatedTransactions {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  if (
    !Array.isArray(record.transactions) ||
    typeof record.hasMore !== 'boolean'
  ) {
    return false;
  }

  // Validate nextCursor consistency with hasMore
  if (record.hasMore && record.nextCursor === null) {
    return false; // hasMore=true requires a valid nextCursor
  }

  if (!record.hasMore && record.nextCursor !== null) {
    return false; // hasMore=false requires nextCursor=null
  }

  // Validate all transactions in array
  return record.transactions.every((t: unknown) => isValidTransaction(t));
}
