/**
 * Hook for fetching rewards transactions with pagination support
 * Per FR-023: Fetch paginated transaction history from GET /rewards/transactions
 * Per FR-024: Use cursor-based pagination for transaction history
 * Per FR-017: Append new transactions without resetting existing items
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
  loadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

/**
 * Fetches and manages transaction history state with pagination
 * @returns Transaction data, loading states, pagination info, loadMore, and refetch
 */
export function useRewardsTransactions(): UseRewardsTransactionsReturn {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Initial fetch
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
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

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const result = await getTransactions(nextCursor, 20);

      // Append new transactions to existing ones
      setData((prevData) => [...prevData, ...result.transactions]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

  // Initial fetch on mount
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Manual refetch function (resets to first page)
  const refetch = useCallback(() => {
    setData([]);
    setNextCursor(null);
    setHasMore(false);
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    hasMore,
    nextCursor,
    loadingMore,
    loadMore,
    refetch,
  };
}
