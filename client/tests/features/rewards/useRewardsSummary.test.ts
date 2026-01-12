/**
 * Hook tests for useRewardsSummary
 * Per tasks T033-T037: Validate loading, error, timeout, and refetch behaviors
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRewardsSummary } from '../../../src/features/rewards/hooks/useRewardsSummary';
import { getSummary } from '../../../src/features/rewards/api/rewardsApi';
import { TimeoutError } from '../../../src/features/rewards/types/api.types';
import type { RewardsSummary } from '../../../src/features/rewards/types/rewards.types';

vi.mock('../../../src/features/rewards/api/rewardsApi', () => ({
  getSummary: vi.fn(),
}));

const mockSummary: RewardsSummary = {
  balance: 123.45,
  currency: 'USD',
};

describe('useRewardsSummary', () => {
  beforeEach(() => {
    vi.mocked(getSummary).mockReset();
  });

  it('should return data and loading=false on successful fetch', async () => {
    vi.mocked(getSummary).mockResolvedValueOnce(mockSummary);

    const { result } = renderHook(() => useRewardsSummary());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockSummary);
    expect(result.current.error).toBeNull();
  });

  it('should set error state and loading=false on API error', async () => {
    const apiError = new Error('API failure');
    vi.mocked(getSummary).mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useRewardsSummary());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(apiError);
    expect(result.current.data).toBeNull();
  });

  it('should surface TimeoutError on request timeout', async () => {
    const timeoutError = new TimeoutError('Request exceeded 5 seconds');
    vi.mocked(getSummary).mockRejectedValueOnce(timeoutError);

    const { result } = renderHook(() => useRewardsSummary());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(timeoutError);
  });

  it('should refetch and clear error state', async () => {
    const apiError = new Error('API failure');
    vi.mocked(getSummary)
      .mockRejectedValueOnce(apiError)
      .mockResolvedValueOnce(mockSummary);

    const { result } = renderHook(() => useRewardsSummary());

    await waitFor(() => {
      expect(result.current.error).toBe(apiError);
    });

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(mockSummary);
    expect(vi.mocked(getSummary)).toHaveBeenCalledTimes(2);
  });
});
