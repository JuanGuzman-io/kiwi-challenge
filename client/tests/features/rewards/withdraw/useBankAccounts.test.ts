/**
 * Tests for useBankAccounts hook
 * Per tasks T014-T017: Write tests FIRST before implementation (TDD)
 * Following useRewardsSummary.test.ts pattern from 001-rewards-home
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '../../../mocks/server';
import {
  bankAccountsErrorHandler,
  bankAccountsEmptyHandler
} from '../../../mocks/bankAccountsHandlers';

// Mock hook import - will be implemented after tests are written
import { useBankAccounts } from '../../../../src/features/rewards/hooks/useBankAccounts';

describe('useBankAccounts', () => {
  beforeEach(() => {
    // Reset handlers before each test
    server.resetHandlers();
  });

  // T014: Successful accounts fetch returns data and loading=false
  it('should successfully fetch bank accounts and set loading to false', async () => {
    const { result } = renderHook(() => useBankAccounts());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.accounts).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Data should be loaded
    expect(result.current.accounts).toEqual([
      {
        id: 'bank-account-002',
        lastFourDigits: '4321',
        accountType: 'Savings',
        isActive: true,
        createdAt: '2026-01-11T17:49:07.091Z',
      },
      {
        id: 'bank-account-001',
        lastFourDigits: '7890',
        accountType: 'Checking',
        isActive: true,
        createdAt: '2026-01-11T17:49:07.082Z',
      },
    ]);
    expect(result.current.error).toBeNull();
  });

  // T015: Loading state is true during initial fetch
  it('should have loading state true during initial fetch', () => {
    const { result } = renderHook(() => useBankAccounts());

    // Should be loading immediately
    expect(result.current.loading).toBe(true);
    expect(result.current.accounts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // T016: API error sets error state and loading=false
  it('should handle API errors and set error state', async () => {
    // Override handler to return error
    server.use(bankAccountsErrorHandler);

    const { result } = renderHook(() => useBankAccounts());

    // Wait for error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Error should be set
    expect(result.current.accounts).toEqual([]);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.name).toBe('APIError');
  });

  // T017: refetch clears error and re-fetches data
  it('should clear error and re-fetch data on refetch', async () => {
    // First, cause an error
    server.use(bankAccountsErrorHandler);

    const { result } = renderHook(() => useBankAccounts());

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
    expect(result.current.accounts).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  // Additional test: Empty accounts array
  it('should handle empty accounts response', async () => {
    // Override handler to return empty response
    server.use(bankAccountsEmptyHandler);

    const { result } = renderHook(() => useBankAccounts());

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have empty accounts array
    expect(result.current.accounts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // Additional test: Filters inactive accounts
  it('should only return active accounts', async () => {
    const { result } = renderHook(() => useBankAccounts());

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All returned accounts should be active
    result.current.accounts.forEach((account) => {
      expect(account.isActive).toBe(true);
    });
  });
});
