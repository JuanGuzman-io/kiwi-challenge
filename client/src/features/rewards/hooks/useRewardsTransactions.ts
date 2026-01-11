/**
 * Hook for fetching rewards transactions (initial load only, no pagination yet)
 * Per FR-023: Fetch paginated transaction history from GET /rewards/transactions
 * Pagination will be added in Phase 5 (US3)
 */

import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '../api/rewardsApi';
import type { Transaction } from '../types/rewards.types';

interface UseRewardsTransactionsReturn {
  data: Transaction[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  nextCursor: string | null;
  refetch: () => void;
}

/**
 * Fetches and manages transaction history state (initial load only)
 * Pagination functionality will be added in Phase 5 (User Story 3)
 * @returns Transaction data, loading state, error state, pagination info, and refetch
 */
export function useRewardsTransactions(): UseRewardsTransactionsReturn {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Initial load - no cursor (first page only for now)
      const result = await getTransactions(null, 20);
      setData(result.transactions);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData([]);
      setHasMore(false);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    hasMore,
    nextCursor,
    refetch,
  };
}
