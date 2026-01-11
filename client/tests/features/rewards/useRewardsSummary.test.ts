/**
 * Tests for useRewardsSummary hook
 * Per tasks T033-T037: Write tests FIRST before implementation (TDD)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock hook import - will be implemented later
import { useRewardsSummary } from '../../../src/features/rewards/hooks/useRewardsSummary';

describe('useRewardsSummary', () => {
  beforeEach(() => {
    // Reset handlers before each test
    server.resetHandlers();
  });

  // T034: Successful balance fetch returns data and loading=false
  it('should successfully fetch balance and set loading to false', async () => {
    const { result } = renderHook(() => useRewardsSummary());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Data should be loaded
    expect(result.current.data).toEqual({
      balance: 1234.56,
      currency: 'USD',
    });
    expect(result.current.error).toBeNull();
  });

  // T035: API error sets error state and loading=false
  it('should handle API errors and set error state', async () => {
    // Override handler to return error
    server.use(
      http.get('/rewards/summary', () => {
        return HttpResponse.json(
          {
            type: 'https://api.example.com/problems/internal-error',
            title: 'Internal Server Error',
            status: 500,
            detail: 'An unexpected error occurred',
          },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useRewardsSummary());

    // Wait for error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Error should be set
    expect(result.current.data).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.name).toBe('APIError');
  });

  // T036: 5-second timeout triggers TimeoutError
  it('should timeout after 5 seconds and trigger TimeoutError', async () => {
    // Override handler to delay response beyond 5 seconds
    server.use(
      http.get('/rewards/summary', async () => {
        await new Promise((resolve) => setTimeout(resolve, 6000));
        return HttpResponse.json({ balance: 0, currency: 'USD' });
      })
    );

    const { result } = renderHook(() => useRewardsSummary());

    // Wait for timeout error
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 7000 }
    );

    // TimeoutError should be set
    expect(result.current.data).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.name).toBe('TimeoutError');
  }, 10000); // Increase test timeout to 10 seconds

  // T037: refetch clears error and re-fetches data
  it('should clear error and re-fetch data on refetch', async () => {
    // First, cause an error
    server.use(
      http.get('/rewards/summary', () => {
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

    const { result } = renderHook(() => useRewardsSummary());

    // Wait for error
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Reset handler to return success
    server.resetHandlers();

    // Call refetch
    result.current.refetch();

    // Should start loading again
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Wait for successful data
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Data should be loaded, error cleared
    expect(result.current.data).toEqual({
      balance: 1234.56,
      currency: 'USD',
    });
    expect(result.current.error).toBeNull();
  });
});
