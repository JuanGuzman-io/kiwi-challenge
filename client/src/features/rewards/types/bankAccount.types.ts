/**
 * Bank Account types for the Withdraw feature
 * Based on plan.md and actual API contract from 002-withdraw spec
 */

/**
 * Bank account for receiving withdrawal funds
 * Source: GET /bank-accounts API response
 */
export interface BankAccount {
  /**
   * Unique bank account identifier
   * @example "bank-account-002"
   */
  id: string;

  /**
   * Last 4 digits of account number (pre-masked from API)
   * @example "4321"
   */
  lastFourDigits: string;

  /**
   * Account type
   * @example "Savings" | "Checking"
   */
  accountType: string;

  /**
   * Whether the account is active and selectable
   * @example true
   */
  isActive: boolean;

  /**
   * ISO 8601 timestamp when account was linked
   * @example "2026-01-11T17:49:07.091Z"
   */
  createdAt: string;
}

/**
 * API response structure for GET /bank-accounts
 * Contains array of accounts and total count
 */
export interface BankAccountsResponse {
  /**
   * Array of bank accounts belonging to authenticated user
   * Sorted by createdAt descending (newest first)
   */
  accounts: BankAccount[];

  /**
   * Total number of accounts returned
   * @example 2
   */
  count: number;
}
