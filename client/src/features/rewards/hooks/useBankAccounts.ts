/**
 * Hook for fetching user's bank accounts for withdrawal
 * Per FR-107: Fetch available withdrawal accounts from GET /bank-accounts
 * Follows useRewardsSummary pattern from 001-rewards-home
 */

import { useState, useEffect, useCallback } from 'react';
import { getBankAccounts } from '../api/bankAccountsApi';
import type { BankAccount } from '../types/bankAccount.types';

/**
 * Return type for useBankAccounts hook
 * Similar to AsyncDataReturn but with accounts array instead of data
 */
export interface UseBankAccountsReturn {
  /**
   * Array of active bank accounts
   * Only includes accounts where isActive: true
   */
  accounts: BankAccount[];

  /**
   * Loading indicator (true during initial load or refetch)
   */
  loading: boolean;

  /**
   * Error object (null if no error)
   */
  error: Error | null;

  /**
   * Manual refetch function (for retry buttons)
   */
  refetch: () => void;
}

/**
 * Fetches and manages bank accounts state
 * Filters to only return active accounts per FR-174
 *
 * @returns UseBankAccountsReturn with accounts array, loading, error, and refetch
 */
export function useBankAccounts(): UseBankAccountsReturn {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch function wrapped with useCallback for stability
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getBankAccounts();

      // Filter to only active accounts per FR-174
      const activeAccounts = response.accounts.filter(
        (account) => account.isActive
      );

      setAccounts(activeAccounts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Manual refetch function (for retry button)
  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return {
    accounts,
    loading,
    error,
    refetch,
  };
}
