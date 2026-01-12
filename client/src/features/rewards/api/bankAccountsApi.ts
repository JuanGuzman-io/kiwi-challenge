/**
 * API client for bank accounts endpoint
 * Based on rewardsApi.ts pattern from 001-rewards-home
 */

import type { BankAccountsResponse } from '../types/bankAccount.types';
import { APIError, TimeoutError } from '../types/api.types';
import { logAPIFailure } from '../utils/logger';

// API base URL from environment variables
const API_BASE_URL = 'http://localhost:3000';

/**
 * Fetch with 5-second timeout and x-user-id header injection
 * Reuses the same pattern from rewardsApi.ts
 * Per FR-108: Implements 5-second timeout and x-user-id header
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
        'x-user-id': userId,
        ...options.headers,
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const apiError = new APIError(
        response.status,
        body,
        `API request failed with status ${response.status}`
      );

      // Log API failure
      logAPIFailure(url, apiError, {
        status: response.status,
        method: options.method || 'GET',
      });

      throw apiError;
    }

    return response;
  } catch (error) {
    clearTimeout(timeout);

    // Convert AbortError to TimeoutError
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new TimeoutError('Request exceeded 5 seconds');

      // Log timeout error
      logAPIFailure(url, timeoutError, {
        method: options.method || 'GET',
      });

      throw timeoutError;
    }

    // Log unexpected errors
    if (error instanceof Error) {
      logAPIFailure(url, error, {
        method: options.method || 'GET',
      });
    }

    throw error;
  }
}

/**
 * GET /bank-accounts
 * Fetches the user's linked bank accounts for withdrawal
 * Per FR-107: Fetch available withdrawal accounts from GET /bank-accounts
 * Per FR-108: Include x-user-id header for authentication
 *
 * @returns Promise resolving to BankAccountsResponse with accounts array and count
 * @throws {APIError} On 401 (unauthorized) or 500 (server error)
 * @throws {TimeoutError} On request timeout (>5 seconds)
 */
export async function getBankAccounts(): Promise<BankAccountsResponse> {
  const url = `${API_BASE_URL}/bank-accounts`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();
  return data as BankAccountsResponse;
}
