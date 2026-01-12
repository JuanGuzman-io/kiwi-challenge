/**
 * Withdraw feature-specific types
 * Based on plan.md from 002-withdraw spec
 */

import type { BankAccount } from './bankAccount.types';

/**
 * React Router location state for withdraw flow
 * Used to persist selected account between /withdraw and /withdraw/accounts routes
 */
export interface WithdrawLocationState {
  /**
   * Bank account selected by user on /withdraw/accounts screen
   * Passed back to /withdraw screen via React Router state
   */
  selectedAccount?: BankAccount;
}
