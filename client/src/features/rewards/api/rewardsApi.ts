/**
 * API client for rewards endpoints
 * Based on contracts/README.md from 001-rewards-home spec
 */

import type { RewardsSummary } from "../types/rewards.types";
import type { PaginatedTransactions } from "../types/api.types";
import { APIError, TimeoutError } from "../types/api.types";

// API base URL from environment variables
const API_BASE_URL = "http://localhost:3000";

/**
 * Fetch with 5-second timeout and x-user-id header injection
 * Per FR-053: Implements 5-second timeout for all API requests
 * Per FR-021: Injects x-user-id header for authentication
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
    const userId = "test-user-001";

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
        ...options.headers,
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        body,
        `API request failed with status ${response.status}`
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeout);

    // Convert AbortError to TimeoutError
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError("Request exceeded 5 seconds");
    }

    throw error;
  }
}

/**
 * GET /rewards/summary
 * Fetches the user's current accumulated rewards balance
 * Per FR-022: Fetch balance and currency from GET /rewards/summary
 */
export async function getSummary(): Promise<RewardsSummary> {
  const url = `${API_BASE_URL}/rewards/summary`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();
  return data as RewardsSummary;
}

/**
 * GET /rewards/transactions
 * Fetches paginated user transaction history with cursor-based pagination
 * Per FR-023: Fetch paginated transaction history from GET /rewards/transactions
 * Per FR-024: Use cursor-based pagination for transaction history
 *
 * @param cursor - Optional cursor for pagination (null for first page)
 * @param limit - Number of transactions per page (default: 20)
 */
export async function getTransactions(
  cursor: string | null = null,
  limit: number = 20
): Promise<PaginatedTransactions> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (cursor) {
    params.append("cursor", cursor);
  }

  const url = `${API_BASE_URL}/rewards/transactions?${params.toString()}`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();
  return data as PaginatedTransactions;
}
