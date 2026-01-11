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
export function isValidTransaction(obj: any): obj is Transaction {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    ['CASHBACK', 'REFERRAL_BONUS', 'WITHDRAWAL', 'INCOME'].includes(obj.type) &&
    typeof obj.amount === 'number' &&
    obj.amount !== 0 &&
    typeof obj.description === 'string' &&
    typeof obj.createdAt === 'string' &&
    !isNaN(Date.parse(obj.createdAt))
  );
}

/**
 * Type guard for RewardsSummary
 * Validates that an object matches the RewardsSummary interface
 */
export function isValidRewardsSummary(obj: any): obj is RewardsSummary {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.balance === 'number' &&
    obj.balance >= 0 &&
    typeof obj.currency === 'string' &&
    obj.currency.length === 3 &&
    obj.currency === obj.currency.toUpperCase()
  );
}

/**
 * Type guard for PaginatedTransactions
 * Validates that an object matches the PaginatedTransactions interface
 */
export function isValidPaginatedTransactions(obj: any): obj is PaginatedTransactions {
  if (
    typeof obj !== 'object' ||
    obj === null ||
    !Array.isArray(obj.transactions) ||
    typeof obj.hasMore !== 'boolean'
  ) {
    return false;
  }

  // Validate nextCursor consistency with hasMore
  if (obj.hasMore && obj.nextCursor === null) {
    return false; // hasMore=true requires a valid nextCursor
  }

  if (!obj.hasMore && obj.nextCursor !== null) {
    return false; // hasMore=false requires nextCursor=null
  }

  // Validate all transactions in array
  return obj.transactions.every((t: any) => isValidTransaction(t));
}
