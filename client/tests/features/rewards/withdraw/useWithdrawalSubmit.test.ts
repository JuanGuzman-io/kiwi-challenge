/**
 * Hook tests for useWithdrawalSubmit
 * Per tasks T008, T030
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWithdrawalSubmit } from '../../../../src/features/rewards/hooks/useWithdrawalSubmit';
import { submitWithdrawal } from '../../../../src/features/rewards/api/withdrawalsApi';
import type {
  WithdrawalRequest,
  WithdrawalResponse,
  ProblemDetails,
} from '../../../../src/features/rewards/types/withdrawal.types';
import { TimeoutError } from '../../../../src/features/rewards/types/api.types';

vi.mock('../../../../src/features/rewards/api/withdrawalsApi', () => ({
  submitWithdrawal: vi.fn(),
}));

const request: WithdrawalRequest = {
  amount: 100,
  bankAccountId: 'bank-account-001',
  currency: 'USD',
};

const response: WithdrawalResponse = {
  id: 'withdrawal-001',
  userId: 'test-user-001',
  amount: 100,
  bankAccountId: 'bank-account-001',
  currency: 'USD',
  status: 'pending',
  createdAt: '2026-01-11T17:49:07.082Z',
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

describe('useWithdrawalSubmit', () => {
  beforeEach(() => {
    vi.mocked(submitWithdrawal).mockReset();
  });

  it('should submit successfully and clear error state', async () => {
    vi.mocked(submitWithdrawal).mockResolvedValueOnce(response);

    const { result } = renderHook(() => useWithdrawalSubmit());

    let submission: WithdrawalResponse | undefined;
    await act(async () => {
      submission = await result.current.submitWithdrawal(request);
    });

    expect(submission).toEqual(response);
    expect(result.current.error).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should set error when submission fails', async () => {
    const problemDetails: ProblemDetails = {
      type: 'https://api.example.com/errors/server-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Unexpected error',
      instance: '/withdrawals',
    };

    vi.mocked(submitWithdrawal).mockRejectedValueOnce(problemDetails);

    const { result } = renderHook(() => useWithdrawalSubmit());

    await act(async () => {
      await result.current.submitWithdrawal(request).catch(() => null);
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(problemDetails);
    });
  });

  it('should prevent duplicate submissions while in flight', async () => {
    const deferred = createDeferred<WithdrawalResponse>();
    vi.mocked(submitWithdrawal).mockReturnValueOnce(deferred.promise as never);

    const { result } = renderHook(() => useWithdrawalSubmit());

    act(() => {
      result.current.submitWithdrawal(request);
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });

    await expect(result.current.submitWithdrawal(request)).rejects.toBeInstanceOf(
      Error
    );
    expect(vi.mocked(submitWithdrawal)).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve(response);
    });
  });

  it('should clear error when clearError is called', async () => {
    vi.mocked(submitWithdrawal).mockRejectedValueOnce(new Error('API error'));

    const { result } = renderHook(() => useWithdrawalSubmit());

    await act(async () => {
      await result.current.submitWithdrawal(request).catch(() => null);
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should surface TimeoutError on timeout', async () => {
    const timeoutError = new TimeoutError('Request exceeded 5 seconds');
    vi.mocked(submitWithdrawal).mockRejectedValueOnce(timeoutError);

    const { result } = renderHook(() => useWithdrawalSubmit());

    await act(async () => {
      await result.current.submitWithdrawal(request).catch(() => null);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(timeoutError);
    });
  });
});
