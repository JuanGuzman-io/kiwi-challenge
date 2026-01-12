/**
 * Hook tests for useBankAccounts
 * Per tasks T014-T017: Validate success, loading, error, and refetch behaviors
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useBankAccounts } from '../../../../src/features/rewards/hooks/useBankAccounts';
import { getBankAccounts } from '../../../../src/features/rewards/api/bankAccountsApi';
import type { BankAccountsResponse } from '../../../../src/features/rewards/types/bankAccount.types';

vi.mock('../../../../src/features/rewards/api/bankAccountsApi', () => ({
  getBankAccounts: vi.fn(),
}));

const mockResponse: BankAccountsResponse = {
  accounts: [
    {
      id: 'bank-account-001',
      lastFourDigits: '1234',
      accountType: 'Checking',
      isActive: true,
      createdAt: '2026-01-11T17:49:07.082Z',
    },
    {
      id: 'bank-account-002',
      lastFourDigits: '5678',
      accountType: 'Savings',
      isActive: false,
      createdAt: '2026-01-11T17:49:07.091Z',
    },
  ],
  count: 2,
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

describe('useBankAccounts', () => {
  beforeEach(() => {
    vi.mocked(getBankAccounts).mockReset();
  });

  it('should return active accounts on success', async () => {
    vi.mocked(getBankAccounts).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBankAccounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toEqual([mockResponse.accounts[0]]);
    expect(result.current.error).toBeNull();
  });

  it('should indicate loading state while request is in flight', async () => {
    const deferred = createDeferred<BankAccountsResponse>();
    vi.mocked(getBankAccounts).mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useBankAccounts());

    expect(result.current.loading).toBe(true);
    expect(result.current.accounts).toEqual([]);

    await act(async () => {
      deferred.resolve(mockResponse);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should set error state on API error', async () => {
    const apiError = new Error('API failure');
    vi.mocked(getBankAccounts).mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useBankAccounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(apiError);
    expect(result.current.accounts).toEqual([]);
  });

  it('should refetch accounts when refetch is called', async () => {
    vi.mocked(getBankAccounts)
      .mockRejectedValueOnce(new Error('API failure'))
      .mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBankAccounts());

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.accounts).toEqual([mockResponse.accounts[0]]);
    expect(vi.mocked(getBankAccounts)).toHaveBeenCalledTimes(2);
  });
});
