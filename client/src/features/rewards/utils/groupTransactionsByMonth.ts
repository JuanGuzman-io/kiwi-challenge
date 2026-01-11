/**
 * Transaction grouping utility with memoization
 * Per FR-006: Group transactions by month with Spanish month name and year headers
 * Per FR-007: Display transactions newest-first
 * Per FR-052: Memoize grouping computation to avoid expensive re-calculations
 */

import type { Transaction, TransactionGroup } from '../types/rewards.types';
import { getMonthName } from './formatMonthHeader';

/**
 * Groups transactions by month (newest first) with memoization
 * This function should be used with useMemo in components for performance
 *
 * @param transactions - Array of transactions (should already be sorted newest-first from API)
 * @returns Array of TransactionGroup objects grouped by month
 */
export function groupTransactionsByMonth(
  transactions: Transaction[]
): TransactionGroup[] {
  if (transactions.length === 0) {
    return [];
  }

  // Group transactions by year-month key
  const grouped = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const date = new Date(transaction.createdAt);
    const year = date.getFullYear();
    const month = getMonthName(transaction.createdAt);
    const key = `${year}-${month}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(transaction);
  }

  // Convert Map to TransactionGroup array
  const groups: TransactionGroup[] = [];

  for (const [key, txns] of grouped.entries()) {
    const [yearStr, month] = key.split('-');
    const year = parseInt(yearStr, 10);

    groups.push({
      month,
      year,
      transactions: txns, // Already sorted newest-first from API
    });
  }

  // Sort groups by year DESC, then by month DESC (newest first)
  groups.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year; // Descending year
    }

    // For same year, sort by month (compare first transaction date)
    const aFirstDate = new Date(a.transactions[0].createdAt);
    const bFirstDate = new Date(b.transactions[0].createdAt);
    return bFirstDate.getTime() - aFirstDate.getTime(); // Descending month
  });

  return groups;
}
