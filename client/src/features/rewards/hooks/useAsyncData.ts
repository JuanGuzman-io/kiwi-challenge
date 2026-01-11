/**
 * Generic hook for async data fetching with loading/error/data pattern
 * Per research.md: Custom hook abstraction over useState/useEffect
 * Reusable pattern for consistent async state management
 */

import { useState, useEffect, useCallback } from 'react';
import type { AsyncDataReturn } from '../types/ui.types';

/**
 * Generic hook for fetching async data
 * @param fetchFn - Async function that returns data
 * @returns AsyncDataReturn with data, loading, error, and refetch
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>
): AsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch function wrapped with useCallback for stability
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

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
    refetch,
  };
}
