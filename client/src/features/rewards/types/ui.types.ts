/**
 * UI state types for the Rewards feature
 * Based on data-model.md from 001-rewards-home spec
 */

import type { Transaction } from './rewards.types';

/**
 * Generic type for async data fetching states (loading, error, data)
 * Used by custom hooks for consistent async state management
 */
export interface AsyncState<T> {
  /**
   * Fetched data (null while loading or on error)
   */
  data: T | null;

  /**
   * Loading indicator (true during initial load or refetch)
   */
  loading: boolean;

  /**
   * Error object (null if no error)
   */
  error: Error | null;
}

/**
 * Extended async state with manual refetch capability
 * Return type for custom data-fetching hooks
 */
export interface AsyncDataReturn<T> extends AsyncState<T> {
  /**
   * Manual refetch function (for retry buttons)
   */
  refetch: () => void;
}

/**
 * State for managing cursor-based pagination
 * Used internally by useRewardsTransactions hook
 */
export interface PaginationState {
  /**
   * Accumulated transactions from all loaded pages
   */
  allTransactions: Transaction[];

  /**
   * Current cursor for next page (null if no more pages)
   */
  nextCursor: string | null;

  /**
   * Whether more pages exist
   */
  hasMore: boolean;

  /**
   * Loading state for next page (distinct from initial load)
   */
  loadingMore: boolean;
}
