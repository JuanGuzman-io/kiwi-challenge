/**
 * Hook for fetching rewards summary (balance)
 * Per FR-022: Fetch balance and currency from GET /rewards/summary
 * Uses useAsyncData for consistent async state management
 */

import { useAsyncData } from './useAsyncData';
import { getSummary } from '../api/rewardsApi';
import type { RewardsSummary } from '../types/rewards.types';
import type { AsyncDataReturn } from '../types/ui.types';

/**
 * Fetches and manages rewards summary state
 * @returns AsyncDataReturn with rewards summary data, loading, error, and refetch
 */
export function useRewardsSummary(): AsyncDataReturn<RewardsSummary> {
  return useAsyncData<RewardsSummary>(getSummary);
}
