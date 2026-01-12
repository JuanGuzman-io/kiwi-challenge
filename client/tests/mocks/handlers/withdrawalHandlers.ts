/**
 * MSW handlers for withdrawal submission API (POST /withdrawals)
 * Based on bankAccountHandlers.ts pattern from 002-withdraw
 * Provides mocks for success (201), errors (404, 500, 429), and timeout scenarios
 */

import { http, HttpResponse, delay } from 'msw';
import type {
  WithdrawalRequest,
  WithdrawalResponse,
  ProblemDetails,
} from '../../../src/features/rewards/types/withdrawal.types';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Success handler: POST /withdrawals returns 201 with withdrawal response
 * Simulates successful withdrawal creation
 */
export const withdrawalSuccessHandler = http.post(
  `${API_BASE_URL}/withdrawals`,
  async ({ request }) => {
    const body = (await request.json()) as WithdrawalRequest;
    const userId = request.headers.get('x-user-id') || 'test-user-001';

    const response: WithdrawalResponse = {
      id: 'withdrawal-001',
      userId,
      amount: body.amount,
      bankAccountId: body.bankAccountId,
      currency: body.currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(response, { status: 201 });
  }
);

/**
 * Error handler: Bank account not found (404)
 * Simulates error when selected bank account doesn't exist or was deleted
 */
export const withdrawalBankAccountNotFoundHandler = http.post(
  `${API_BASE_URL}/withdrawals`,
  async () => {
    const problemDetails: ProblemDetails = {
      type: 'https://api.example.com/errors/bank-account-not-found',
      title: 'Bank Account Not Found',
      status: 404,
      detail: 'The specified bank account does not exist or is not accessible',
      instance: '/withdrawals',
      bankAccountId: 'bank-account-001',
    };

    return HttpResponse.json(problemDetails, { status: 404 });
  }
);

/**
 * Error handler: Server error (500)
 * Simulates internal server error during withdrawal processing
 */
export const withdrawalServerErrorHandler = http.post(
  `${API_BASE_URL}/withdrawals`,
  async () => {
    const problemDetails: ProblemDetails = {
      type: 'https://api.example.com/errors/server-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred while processing your withdrawal',
      instance: '/withdrawals',
    };

    return HttpResponse.json(problemDetails, { status: 500 });
  }
);

/**
 * Error handler: Cooldown active (429)
 * Simulates cooldown enforcement (user submitted withdrawal too recently)
 */
export const withdrawalCooldownHandler = http.post(
  `${API_BASE_URL}/withdrawals`,
  async () => {
    const problemDetails: ProblemDetails = {
      type: 'https://api.example.com/errors/cooldown-active',
      title: 'Cooldown Active',
      status: 429,
      detail:
        'You must wait a few minutes before making another withdrawal with the same amount',
      instance: '/withdrawals',
    };

    return HttpResponse.json(problemDetails, { status: 429 });
  }
);

/**
 * Timeout handler: Request takes longer than 5 seconds
 * Simulates network timeout scenario
 */
export const withdrawalTimeoutHandler = http.post(
  `${API_BASE_URL}/withdrawals`,
  async () => {
    // Delay longer than 5-second timeout
    await delay(6000);

    const response: WithdrawalResponse = {
      id: 'withdrawal-001',
      userId: 'test-user-001',
      amount: 1234.56,
      bankAccountId: 'bank-account-001',
      currency: 'USD',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(response, { status: 201 });
  }
);

/**
 * Default export: Success handler for normal test scenarios
 */
export const withdrawalHandlers = [withdrawalSuccessHandler];
