/**
 * Hook tests for useRewardsTransactions
 * Per tasks T054-T059, T082-T085: Validate pagination, ordering, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRewardsTransactions } from '../../../src/features/rewards/hooks/useRewardsTransactions';
import { getTransactions } from '../../../src/features/rewards/api/rewardsApi';
import { TimeoutError } from '../../../src/features/rewards/types/api.types';
import type { PaginatedTransactions } from '../../../src/features/rewards/types/api.types';
import type { Transaction } from '../../../src/features/rewards/types/rewards.types';

vi.mock('../../../src/features/rewards/api/rewardsApi', () => ({
  getTransactions: vi.fn(),
}));

const firstPageTransactions: Transaction[] = [
  {
    id: 'txn_001',
    type: 'CASHBACK',
    amount: 25.5,
    description: 'Cashback on purchase #12345',
    createdAt: '2025-09-15T14:30:00Z',
  },
  {
    id: 'txn_002',
    type: 'WITHDRAWAL',
    amount: -10.0,
    description: 'Withdrawal to Bank Account ****1234',
    createdAt: '2025-09-10T10:15:00Z',
  },
];

const secondPageTransactions: Transaction[] = [
  {
    id: 'txn_003',
    type: 'REFERRAL_BONUS',
    amount: 15.0,
    description: 'Referral bonus for inviting user@example.com',
    createdAt: '2025-08-28T16:45:00Z',
  },
];

const firstPageResponse: PaginatedTransactions = {
  transactions: firstPageTransactions,
  nextCursor: 'cursor_page2',
  hasMore: true,
  count: 3,
};

const secondPageResponse: PaginatedTransactions = {
  transactions: secondPageTransactions,
  nextCursor: null,
  hasMore: false,
  count: 3,
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useRewardsTransactions', () => {
  beforeEach(() => {
    vi.mocked(getTransactions).mockReset();
  });

  it('should fetch first page on initial load', async () => {
    vi.mocked(getTransactions).mockResolvedValueOnce(firstPageResponse);

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(firstPageTransactions);
    expect(vi.mocked(getTransactions)).toHaveBeenCalledWith(null, 20);
  });

  it('should preserve newest-first order from API response', async () => {
    vi.mocked(getTransactions).mockResolvedValueOnce(firstPageResponse);

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data.map((txn) => txn.id)).toEqual([
      'txn_001',
      'txn_002',
    ]);
  });

  it('should handle empty transactions array', async () => {
    vi.mocked(getTransactions).mockResolvedValueOnce({
      transactions: [],
      nextCursor: null,
      hasMore: false,
      count: 0,
    });

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it('should set error state and loading=false on API error', async () => {
    const apiError = new Error('API failure');
    vi.mocked(getTransactions).mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(apiError);
    expect(result.current.data).toEqual([]);
  });

  it('should surface TimeoutError on request timeout', async () => {
    const timeoutError = new TimeoutError('Request exceeded 5 seconds');
    vi.mocked(getTransactions).mockRejectedValueOnce(timeoutError);

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(timeoutError);
  });

  it('should append transactions when loadMore is called', async () => {
    vi.mocked(getTransactions)
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse);

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.data.length).toBe(3);
    });

    expect(result.current.data.map((txn) => txn.id)).toEqual([
      'txn_001',
      'txn_002',
      'txn_003',
    ]);
  });

  it('should update hasMore flag based on pagination response', async () => {
    vi.mocked(getTransactions)
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse);

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });
  });

  it('should set loadingMore=true while pagination request is in flight', async () => {
    const deferred = createDeferred<PaginatedTransactions>();
    vi.mocked(getTransactions)
      .mockResolvedValueOnce(firstPageResponse)
      .mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(true);
    });

    await act(async () => {
      deferred.resolve(secondPageResponse);
    });

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });
  });

  it('should pass nextCursor to getTransactions when loading more', async () => {
    vi.mocked(getTransactions)
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse);

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(vi.mocked(getTransactions)).toHaveBeenNthCalledWith(1, null, 20);
    expect(vi.mocked(getTransactions)).toHaveBeenNthCalledWith(
      2,
      'cursor_page2',
      20
    );
  });
});
