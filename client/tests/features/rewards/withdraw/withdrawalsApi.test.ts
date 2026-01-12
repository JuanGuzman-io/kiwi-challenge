/**
 * Unit tests for withdrawalsApi submitWithdrawal
 * Per task T007
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';
import { submitWithdrawal } from '../../../../src/features/rewards/api/withdrawalsApi';
import {
  withdrawalBankAccountNotFoundHandler,
  withdrawalServerErrorHandler,
} from '../../../mocks/handlers/withdrawalHandlers';
import type { WithdrawalRequest } from '../../../../src/features/rewards/types/withdrawal.types';

const API_BASE_URL = 'http://localhost:3000';

const request: WithdrawalRequest = {
  amount: 100,
  bankAccountId: 'bank-account-001',
  currency: 'USD',
};

describe('submitWithdrawal', () => {
  afterEach(() => {
    server.resetHandlers();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should submit withdrawal and return response on success', async () => {
    const response = await submitWithdrawal(request);

    expect(response.amount).toBe(100);
    expect(response.currency).toBe('USD');
    expect(response.bankAccountId).toBe('bank-account-001');
    expect(response.id).toBeTruthy();
  });

  it('should throw ProblemDetails on 404 response', async () => {
    server.use(withdrawalBankAccountNotFoundHandler);

    await expect(submitWithdrawal(request)).rejects.toMatchObject({
      status: 404,
      title: 'Bank Account Not Found',
    });
  });

  it('should throw ProblemDetails on 500 response', async () => {
    server.use(withdrawalServerErrorHandler);

    await expect(submitWithdrawal(request)).rejects.toMatchObject({
      status: 500,
      title: 'Internal Server Error',
    });
  });

  it('should throw TimeoutError when request exceeds 5 seconds', async () => {
    vi.useFakeTimers();

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const signal = init?.signal as AbortSignal | undefined;
        return new Promise((_, reject) => {
          if (signal) {
            signal.addEventListener('abort', () => {
              const error = new Error('Aborted');
              error.name = 'AbortError';
              reject(error);
            });
          }
        });
      })
    );

    const promise = submitWithdrawal(request);
    const rejection = expect(promise).rejects.toMatchObject({
      name: 'TimeoutError',
    });

    await vi.runAllTimersAsync();
    await rejection;
  });

  it('should send payload to POST /withdrawals', async () => {
    const handler = vi.fn(async ({ request: req }) => {
      const body = await req.json();
      return HttpResponse.json(
        {
          id: 'withdrawal-123',
          userId: 'test-user-001',
          amount: body.amount,
          bankAccountId: body.bankAccountId,
          currency: body.currency,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    });

    server.use(http.post(`${API_BASE_URL}/withdrawals`, handler));

    await submitWithdrawal(request);

    expect(handler).toHaveBeenCalled();
  });
});
