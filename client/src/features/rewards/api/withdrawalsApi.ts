/**
 * API client for withdrawals endpoint
 * Based on bankAccountsApi.ts pattern from 002-withdraw
 * Implements POST /withdrawals for withdrawal submission (003-withdraw-submit)
 */

import type {
  WithdrawalRequest,
  WithdrawalResponse,
  ProblemDetails,
} from '../types/withdrawal.types';
import { APIError, TimeoutError } from '../types/api.types';
import { logAPIFailure } from '../utils/logger';

// API base URL from environment variables
const API_BASE_URL = 'http://localhost:3000';

/**
 * Fetch with 5-second timeout and x-user-id header injection
 * Reuses the same pattern from bankAccountsApi.ts and rewardsApi.ts
 * Per FR-049: Implements 5-second timeout pattern consistent with existing API clients
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    // TODO: Get user ID from authentication context
    // For now, using a placeholder - will be replaced with actual auth context
    const userId = 'test-user-001';

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json', // FR-004
        'x-user-id': userId,
        ...options.headers,
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      // Parse Problem Details from response body (FR-014 to FR-020)
      const body = await response.json().catch(() => ({
        type: 'unknown-error',
        title: 'Unknown Error',
        status: response.status,
        detail: `Request failed with status ${response.status}`,
        instance: '/withdrawals',
      }));

      const problemDetails = body as ProblemDetails;

      // Log API failure
      logAPIFailure(url, problemDetails, {
        status: response.status,
        method: options.method || 'POST',
      });

      throw problemDetails;
    }

    return response;
  } catch (error) {
    clearTimeout(timeout);

    // Convert AbortError to TimeoutError
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new TimeoutError('Request exceeded 5 seconds');

      // Log timeout error
      logAPIFailure(url, timeoutError, {
        method: options.method || 'POST',
      });

      throw timeoutError;
    }

    // Log unexpected errors (but re-throw ProblemDetails as-is)
    if (error instanceof Error && !(error as ProblemDetails).detail) {
      logAPIFailure(url, error, {
        method: options.method || 'POST',
      });
    }

    throw error;
  }
}

/**
 * POST /withdrawals
 * Submits a withdrawal request to transfer funds from rewards balance to bank account
 * Per FR-003: POST http://localhost:3000/withdrawals
 * Per FR-004: Include headers accept: application/json and Content-Type: application/json
 * Per FR-005: Send request body with amount, bankAccountId, currency
 *
 * @param request - Withdrawal request payload
 * @returns Promise resolving to WithdrawalResponse on success (201)
 * @throws {ProblemDetails} On 400/404/429/500 errors with Problem Details format
 * @throws {TimeoutError} On request timeout (>5 seconds)
 */
export async function submitWithdrawal(
  request: WithdrawalRequest
): Promise<WithdrawalResponse> {
  const url = `${API_BASE_URL}/withdrawals`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  const data = await response.json();
  return data as WithdrawalResponse;
}
