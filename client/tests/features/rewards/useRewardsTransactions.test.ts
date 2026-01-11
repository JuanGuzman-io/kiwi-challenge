/**
 * Tests for useRewardsTransactions hook
 * Per tasks T054-T059: Write tests FIRST before implementation (TDD)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock hook import - will be implemented later
import { useRewardsTransactions } from '../../../src/features/rewards/hooks/useRewardsTransactions';

describe('useRewardsTransactions', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  // T055: Initial load fetches first page of transactions
  it('should fetch first page of transactions on initial load', async () => {
    const { result } = renderHook(() => useRewardsTransactions());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // First page should be loaded (3 transactions from mock)
    expect(result.current.data).toHaveLength(3);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.nextCursor).toBe('cursor_page2');
  });

  // T056: Transactions ordered newest-first (descending createdAt)
  it('should return transactions in newest-first order', async () => {
    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const transactions = result.current.data;
    expect(transactions.length).toBeGreaterThan(0);

    // Check that dates are in descending order
    for (let i = 0; i < transactions.length - 1; i++) {
      const current = new Date(transactions[i].createdAt);
      const next = new Date(transactions[i + 1].createdAt);
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
    }
  });

  // T057: Empty transactions array handled correctly
  it('should handle empty transactions array', async () => {
    // Override handler to return empty array
    server.use(
      http.get('/rewards/transactions', () => {
        return HttpResponse.json({
          transactions: [],
          nextCursor: null,
          hasMore: false,
          count: 0,
        });
      })
    );

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.nextCursor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // T058: API error sets error state and loading=false
  it('should handle API errors and set error state', async () => {
    // Override handler to return error
    server.use(
      http.get('/rewards/transactions', () => {
        return HttpResponse.json(
          {
            type: 'https://api.example.com/problems/internal-error',
            title: 'Internal Server Error',
            status: 500,
          },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.name).toBe('APIError');
  });

  // T059: 5-second timeout triggers TimeoutError
  it('should timeout after 5 seconds and trigger TimeoutError', async () => {
    // Override handler to delay response beyond 5 seconds
    server.use(
      http.get('/rewards/transactions', async () => {
        await new Promise((resolve) => setTimeout(resolve, 6000));
        return HttpResponse.json({
          transactions: [],
          nextCursor: null,
          hasMore: false,
        });
      })
    );

    const { result } = renderHook(() => useRewardsTransactions());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 7000 }
    );

    expect(result.current.data).toEqual([]);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.name).toBe('TimeoutError');
  }, 10000);
});
