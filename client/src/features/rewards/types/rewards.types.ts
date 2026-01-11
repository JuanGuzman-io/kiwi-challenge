/**
 * Core domain types for the Rewards feature
 * Based on data-model.md from 001-rewards-home spec
 */

/**
 * User's current accumulated rewards balance
 * Source: GET /rewards/summary API response
 */
export interface RewardsSummary {
  /**
   * User's current accumulated balance
   * @example 1234.56
   */
  balance: number;

  /**
   * ISO 4217 currency code
   * @example "USD"
   */
  currency: string;
}

/**
 * Transaction type enumeration
 */
export type TransactionType = 'CASHBACK' | 'REFERRAL_BONUS' | 'WITHDRAWAL' | 'INCOME' | 'ATH';

/**
 * Single reward activity (credit or debit)
 * Source: GET /rewards/transactions API response
 */
export interface Transaction {
  /**
   * Unique transaction identifier
   * @example "txn_abc123xyz"
   */
  id: string;

  /**
   * Transaction type
   */
  type: TransactionType;

  /**
   * Signed transaction amount
   * Positive for incoming (CASHBACK, REFERRAL_BONUS, INCOME)
   * Negative for outgoing (WITHDRAWAL)
   * @example 25.50 (incoming) or -10.00 (outgoing)
   */
  amount: number;

  /**
   * Human-readable transaction description
   * @example "Cashback on purchase #12345"
   */
  description: string;

  /**
   * ISO 8601 timestamp
   * @example "2025-09-15T14:30:00Z"
   */
  createdAt: string;
}

/**
 * Transactions grouped by month for UI rendering
 * Computed from Transaction[] by groupTransactionsByMonth utility
 */
export interface TransactionGroup {
  /**
   * Spanish month name
   * @example "Septiembre"
   */
  month: string;

  /**
   * Four-digit year
   * @example 2025
   */
  year: number;

  /**
   * Transactions in this month, sorted newest-first within month
   */
  transactions: Transaction[];
}
