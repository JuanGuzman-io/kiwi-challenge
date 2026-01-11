/**
 * API-related types for the Rewards feature
 * Based on data-model.md and contracts/README.md from 001-rewards-home spec
 */

import type { Transaction } from './rewards.types';

/**
 * Paginated response from GET /rewards/transactions
 * Uses cursor-based pagination for consistency
 */
export interface PaginatedTransactions {
  /**
   * Array of transactions for current page
   */
  transactions: Transaction[];

  /**
   * Cursor for next page (null if no more pages)
   * Opaque string identifier for cursor-based pagination
   * @example "cursor_xyz789" | null
   */
  nextCursor: string | null;

  /**
   * Whether more transactions exist beyond current page
   */
  hasMore: boolean;

  /**
   * Total count of transactions for this user (optional)
   * May not be provided by API for performance reasons
   */
  count?: number;
}

/**
 * Custom error type for API failures
 * Extends Error with HTTP status code and response body
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public body: any,
    message: string = 'API request failed'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Custom error type for request timeouts (5-second threshold)
 * Thrown when AbortController triggers timeout
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Request exceeded 5 seconds') {
    super(message);
    this.name = 'TimeoutError';
  }
}
