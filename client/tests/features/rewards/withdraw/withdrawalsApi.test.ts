/**
 * Tests for withdrawalsApi.ts
 * Per tasks T007: Unit tests for submitWithdrawal API client
 * Following TDD approach - tests written FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../../../mocks/server';
import { submitWithdrawal } from '../../../../src/features/rewards/api/withdrawalsApi';
import type {
  WithdrawalRequest,
  WithdrawalResponse,
  ProblemDetails,
} from '../../../../src/features/rewards/types/withdrawal.types';
import {
  withdrawalSuccessHandler,
  withdrawalBankAccountNotFoundHandler,
  withdrawalServerErrorHandler,
  withdrawalTimeoutHandler,
} from '../../../mocks/handlers/withdrawalHandlers';

describe('withdrawalsApi', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  const mockRequest: WithdrawalRequest = {
    amount: 1234.56,
    bankAccountId: 'bank-account-001',
    currency: 'USD',
  };

  describe('submitWithdrawal', () => {
    it('should successfully submit withdrawal and return WithdrawalResponse', async () => {
      server.use(withdrawalSuccessHandler);

      const result = await submitWithdrawal(mockRequest);

      expect(result).toMatchObject({
        id: expect.any(String),
        userId: 'test-user-001',
        amount: mockRequest.amount,
        bankAccountId: mockRequest.bankAccountId,
        currency: mockRequest.currency,
        status: 'pending',
        createdAt: expect.any(String),
      });
    });

    it('should send POST request with correct payload', async () => {
      server.use(withdrawalSuccessHandler);

      const result = await submitWithdrawal(mockRequest);

      // Verify response echoes request fields (per contract)
      expect(result.userId).toBe('test-user-001');
      expect(result.amount).toBe(mockRequest.amount);
      expect(result.bankAccountId).toBe(mockRequest.bankAccountId);
      expect(result.currency).toBe(mockRequest.currency);
    });

    it('should throw ProblemDetails on 404 bank account not found', async () => {
      server.use(withdrawalBankAccountNotFoundHandler);

      await expect(submitWithdrawal(mockRequest)).rejects.toMatchObject({
        type: 'https://api.example.com/errors/bank-account-not-found',
        title: 'Bank Account Not Found',
        status: 404,
        detail: 'The specified bank account does not exist or is not accessible',
        instance: '/withdrawals',
      } as ProblemDetails);
    });

    it('should throw ProblemDetails on 500 server error', async () => {
      server.use(withdrawalServerErrorHandler);

      await expect(submitWithdrawal(mockRequest)).rejects.toMatchObject({
        type: 'https://api.example.com/errors/server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred while processing your withdrawal',
        instance: '/withdrawals',
      } as ProblemDetails);
    });

    it('should throw TimeoutError when request exceeds 5 seconds', async () => {
      server.use(withdrawalTimeoutHandler);

      await expect(submitWithdrawal(mockRequest)).rejects.toMatchObject({
        message: 'Request exceeded 5 seconds',
        name: 'TimeoutError',
      });
    }, 10000); // 10-second test timeout to allow for 6-second delay + processing

    it('should include Content-Type and accept headers', async () => {
      // Headers are verified by MSW - if headers are missing, the request would fail
      // This test verifies the API client sends the request successfully
      server.use(withdrawalSuccessHandler);

      const result = await submitWithdrawal(mockRequest);

      // If we got a successful response, headers were correct (per FR-004)
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('should include x-user-id header', async () => {
      // x-user-id header is required by MSW handlers (they check it)
      // If the header is missing, MSW would return 401
      server.use(withdrawalSuccessHandler);

      const result = await submitWithdrawal(mockRequest);

      // If we got a successful response, x-user-id header was present
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('should parse ISO timestamp from createdAt field', async () => {
      server.use(withdrawalSuccessHandler);

      const result = await submitWithdrawal(mockRequest);

      // Verify createdAt is valid ISO 8601 timestamp
      expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);
    });
  });
});
