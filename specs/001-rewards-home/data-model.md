# Data Model: Rewards Overview (Rewards Home)

**Feature**: 001-rewards-home
**Date**: 2026-01-11
**Context**: Frontend state model for rewards balance and transaction history

## Overview

This document defines the frontend data model (TypeScript types) for the Rewards Overview feature. These types represent the shape of data flowing through the application: API responses, component props, hook return values, and UI state.

**Note**: This is a frontend-only feature. Backend data models (Prisma schema) are defined in the `001-rewards-backend` spec and are out of scope here.

---

## Core Domain Types

### RewardsSummary

Represents the user's current accumulated rewards balance.

**Source**: GET /rewards/summary API response
**Used by**: useRewardsSummary hook, BalanceSummaryCard component

```typescript
export interface RewardsSummary {
  /**
   * User's current accumulated balance
   * @example 1234.56
   */
  balance: number;

  /**
   * ISO 4217 currency code
   * @example "USD"
   */
  currency: string;
}
```

**Validation Rules**:
- `balance` must be a non-negative number (>= 0)
- `currency` must be a valid ISO 4217 code (3 uppercase letters)

**Related Requirements**:
- FR-002: Display balance with currency and amount
- FR-003: Display "Monto acumulado" label
- FR-038: Format currency consistently

---

### Transaction

Represents a single reward activity (credit or debit).

**Source**: GET /rewards/transactions API response (array of Transaction)
**Used by**: useRewardsTransactions hook, TransactionItem component

```typescript
export type TransactionType = 'CASHBACK' | 'REFERRAL_BONUS' | 'WITHDRAWAL' | 'INCOME';

export interface Transaction {
  /**
   * Unique transaction identifier
   * @example "txn_abc123xyz"
   */
  id: string;

  /**
   * Transaction type
   */
  type: TransactionType;

  /**
   * Signed transaction amount
   * Positive for incoming (CASHBACK, REFERRAL_BONUS, INCOME)
   * Negative for outgoing (WITHDRAWAL)
   * @example 25.50 (incoming) or -10.00 (outgoing)
   */
  amount: number;

  /**
   * Human-readable transaction description
   * @example "Cashback on purchase #12345"
   */
  description: string;

  /**
   * ISO 8601 timestamp
   * @example "2025-09-15T14:30:00Z"
   */
  createdAt: string;
}
```

**Validation Rules**:
- `id` must be a non-empty string
- `type` must be one of the defined TransactionType values
- `amount` must be non-zero (positive for credits, negative for debits)
- `description` should be non-empty (fallback to type if empty)
- `createdAt` must be a valid ISO 8601 datetime string

**Type Mapping** (backend → frontend labels, per A-005):
- `CASHBACK` → "Cashback"
- `REFERRAL_BONUS` → "Referral bonus"
- `WITHDRAWAL` → "Withdrawal"
- `INCOME` → "Income"

**Related Requirements**:
- FR-005: Display transaction title/type, date, and signed amount
- FR-007: Display transactions newest-first
- FR-008: Signed amounts with +/- prefix
- FR-009: Visual distinction between incoming/outgoing
- FR-010: Support Cashback, Referral bonus, Withdrawal, Income types

---

### PaginatedTransactions

Represents a paginated response from GET /rewards/transactions with cursor-based pagination.

**Source**: GET /rewards/transactions API response
**Used by**: useRewardsTransactions hook

```typescript
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
```

**Validation Rules**:
- `transactions` must be a non-null array (may be empty)
- `nextCursor` is null if and only if `hasMore` is false
- `hasMore` must match presence of `nextCursor` (consistency check)

**Related Requirements**:
- FR-016: Support pagination with "Load more" button
- FR-017: Append new transactions without resetting existing items
- FR-024: Use cursor-based pagination for consistency

---

### TransactionGroup

Represents transactions grouped by month for UI rendering.

**Source**: Computed from Transaction[] array by groupTransactionsByMonth utility
**Used by**: TransactionList component

```typescript
export interface TransactionGroup {
  /**
   * Spanish month name
   * @example "Septiembre"
   */
  month: string;

  /**
   * Four-digit year
   * @example 2025
   */
  year: number;

  /**
   * Transactions in this month, sorted newest-first within month
   */
  transactions: Transaction[];
}
```

**Derivation Logic**:
1. Parse each transaction's `createdAt` timestamp
2. Extract month and year
3. Format month name using Intl.DateTimeFormat('es-ES', { month: 'long' })
4. Group transactions by (year, month) tuple
5. Sort groups by year DESC, month DESC (newest first)
6. Within each group, maintain newest-first order of transactions

**Related Requirements**:
- FR-006: Group transactions by month with Spanish month name and year headers
- FR-007: Display transactions newest-first
- FR-041: Format month group headers consistently (Spanish month + year)
- FR-052: Memoize grouping computation to avoid expensive re-calculations

---

## UI State Types

### AsyncState

Generic type for async data fetching states (loading, error, data).

**Used by**: useAsyncData hook, useRewardsSummary, useRewardsTransactions

```typescript
export interface AsyncState<T> {
  /**
   * Fetched data (null while loading or on error)
   */
  data: T | null;

  /**
   * Loading indicator (true during initial load or refetch)
   */
  loading: boolean;

  /**
   * Error object (null if no error)
   */
  error: Error | null;
}

export interface AsyncDataReturn<T> extends AsyncState<T> {
  /**
   * Manual refetch function (for retry buttons)
   */
  refetch: () => void;
}
```

**State Transitions**:
- **Initial**: `{ data: null, loading: true, error: null }`
- **Success**: `{ data: T, loading: false, error: null }`
- **Error**: `{ data: null, loading: false, error: Error }`
- **Refetch**: `{ data: prev, loading: true, error: null }` (preserves previous data during refetch)

**Related Requirements**:
- FR-025: Display skeleton/loader placeholders while balance loading
- FR-026: Display skeleton/loader placeholders while transactions loading
- FR-033: Display error message with retry action when summary API fails
- FR-034: Display error message with retry action when transactions API fails

---

### PaginationState

State for managing cursor-based pagination in useRewardsTransactions hook.

**Used by**: useRewardsTransactions hook internally

```typescript
export interface PaginationState {
  /**
   * Accumulated transactions from all loaded pages
   */
  allTransactions: Transaction[];

  /**
   * Current cursor for next page (null if no more pages)
   */
  nextCursor: string | null;

  /**
   * Whether more pages exist
   */
  hasMore: boolean;

  /**
   * Loading state for next page (distinct from initial load)
   */
  loadingMore: boolean;
}
```

**State Transitions**:
- **Initial**: `{ allTransactions: [], nextCursor: null, hasMore: false, loadingMore: false }`
- **First page loaded**: `{ allTransactions: [page1], nextCursor: cursor1, hasMore: true, loadingMore: false }`
- **Loading more**: `{ allTransactions: [page1], nextCursor: cursor1, hasMore: true, loadingMore: true }`
- **Next page loaded**: `{ allTransactions: [page1, page2], nextCursor: cursor2, hasMore: true, loadingMore: false }`
- **Final page loaded**: `{ allTransactions: [page1, page2, page3], nextCursor: null, hasMore: false, loadingMore: false }`

**Related Requirements**:
- FR-017: Append new transactions without resetting existing items
- FR-018: Disable "Load more" button while loading next page
- FR-019: Hide/disable "Load more" when all transactions loaded
- FR-020: Maintain layout stability when loading more transactions

---

## Error Types

### APIError

Custom error type for API failures.

**Used by**: rewardsApi.ts, error handling in hooks

```typescript
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
```

**Usage**:
```typescript
if (!response.ok) {
  throw new APIError(response.status, await response.json(), 'Failed to fetch summary');
}
```

---

### TimeoutError

Custom error type for request timeouts (5-second threshold).

**Used by**: fetchWithTimeout utility, error handling in hooks

```typescript
export class TimeoutError extends Error {
  constructor(message: string = 'Request exceeded 5 seconds') {
    super(message);
    this.name = 'TimeoutError';
  }
}
```

**Usage**:
```typescript
if (error.name === 'AbortError') {
  throw new TimeoutError();
}
```

**Related Requirements**:
- FR-053: Implement 5-second timeout for all API requests
- Clarification: 5-second threshold before showing error state

---

## Component Prop Types

### BalanceSummaryCardProps

Props for BalanceSummaryCard component.

```typescript
export interface BalanceSummaryCardProps {
  /**
   * User's accumulated balance (null while loading)
   */
  balance: number | null;

  /**
   * ISO 4217 currency code
   */
  currency: string;

  /**
   * Loading state for balance fetch
   */
  loading: boolean;

  /**
   * Error state for balance fetch
   */
  error: Error | null;

  /**
   * Callback for "Retirar" button click
   */
  onWithdraw: () => void;

  /**
   * Callback for retry button (shown on error)
   */
  onRetry: () => void;
}
```

---

### TransactionListProps

Props for TransactionList component.

```typescript
export interface TransactionListProps {
  /**
   * All transactions loaded so far (accumulated from pagination)
   */
  transactions: Transaction[];

  /**
   * Loading state for initial transaction fetch
   */
  loading: boolean;

  /**
   * Loading state for "Load more" action
   */
  loadingMore: boolean;

  /**
   * Error state for transaction fetch
   */
  error: Error | null;

  /**
   * Whether more transactions exist to load
   */
  hasMore: boolean;

  /**
   * Callback for "Load more" button click
   */
  onLoadMore: () => void;

  /**
   * Callback for retry button (shown on error)
   */
  onRetry: () => void;
}
```

---

### TransactionItemProps

Props for TransactionItem component.

```typescript
export interface TransactionItemProps {
  /**
   * Transaction data
   */
  transaction: Transaction;
}
```

---

### ErrorStateProps

Props for ErrorState shared component.

```typescript
export interface ErrorStateProps {
  /**
   * User-friendly error message in Spanish
   * @example "No pudimos cargar tu balance. Por favor, intenta de nuevo."
   */
  message: string;

  /**
   * Callback for retry button
   */
  onRetry: () => void;
}
```

---

### LoadingStateProps

Props for LoadingState shared component.

```typescript
export interface LoadingStateProps {
  /**
   * Type of loading state (affects skeleton structure)
   */
  type: 'balance' | 'transactions' | 'pagination';
}
```

---

### EmptyStateProps

Props for EmptyState shared component.

```typescript
export interface EmptyStateProps {
  /**
   * Empty state message
   * @example "Aún no tienes actividad"
   */
  message: string;
}
```

---

## Type File Organization

Types are organized by concern in the feature directory:

```text
client/src/features/rewards/types/
├── rewards.types.ts       # Domain types (RewardsSummary, Transaction, etc.)
├── api.types.ts           # API-related types (PaginatedTransactions, APIError, etc.)
├── ui.types.ts            # UI state types (AsyncState, PaginationState)
└── component.types.ts     # Component prop types (exported from components themselves)
```

**Import Convention**:
```typescript
// Prefer named imports from feature types
import type { RewardsSummary, Transaction, TransactionType } from '../types/rewards.types';
import type { PaginatedTransactions } from '../types/api.types';
import type { AsyncDataReturn } from '../types/ui.types';
```

---

## Validation & Type Guards

### Type Guards

Utility functions for runtime type validation (useful for API responses).

```typescript
// client/src/features/rewards/utils/typeGuards.ts

export function isValidTransaction(obj: any): obj is Transaction {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    ['CASHBACK', 'REFERRAL_BONUS', 'WITHDRAWAL', 'INCOME'].includes(obj.type) &&
    typeof obj.amount === 'number' &&
    obj.amount !== 0 &&
    typeof obj.description === 'string' &&
    typeof obj.createdAt === 'string' &&
    !isNaN(Date.parse(obj.createdAt))
  );
}

export function isValidRewardsSummary(obj: any): obj is RewardsSummary {
  return (
    typeof obj === 'object' &&
    typeof obj.balance === 'number' &&
    obj.balance >= 0 &&
    typeof obj.currency === 'string' &&
    obj.currency.length === 3 &&
    obj.currency === obj.currency.toUpperCase()
  );
}
```

**Usage**:
```typescript
const response = await fetchSummary();
if (!isValidRewardsSummary(response)) {
  throw new Error('Invalid API response format');
}
return response; // TypeScript knows this is RewardsSummary
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ useRewardsSummary Hook                                       │
├─────────────────────────────────────────────────────────────┤
│ Initial: { data: null, loading: true, error: null }         │
│    ↓                                                          │
│ API Call: GET /rewards/summary                               │
│    ↓                                                          │
│ Success: { data: RewardsSummary, loading: false, error: null }│
│ OR                                                            │
│ Error:   { data: null, loading: false, error: Error }       │
│    ↓                                                          │
│ Retry (refetch): { data: prev, loading: true, error: null } │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ useRewardsTransactions Hook                                  │
├─────────────────────────────────────────────────────────────┤
│ Initial: { data: [], loading: true, error: null,            │
│            nextCursor: null, hasMore: false, loadingMore: false }│
│    ↓                                                          │
│ API Call: GET /rewards/transactions?limit=20                 │
│    ↓                                                          │
│ Success (page 1): {                                          │
│   data: [txn1, txn2, ...],                                   │
│   loading: false,                                            │
│   error: null,                                               │
│   nextCursor: "cursor_abc",                                  │
│   hasMore: true,                                             │
│   loadingMore: false                                         │
│ }                                                             │
│    ↓                                                          │
│ User clicks "Load More"                                       │
│    ↓                                                          │
│ Loading more: {                                              │
│   data: [txn1, txn2, ...],  (unchanged)                      │
│   loading: false,                                            │
│   error: null,                                               │
│   nextCursor: "cursor_abc",                                  │
│   hasMore: true,                                             │
│   loadingMore: true                                          │
│ }                                                             │
│    ↓                                                          │
│ API Call: GET /rewards/transactions?cursor=cursor_abc&limit=20│
│    ↓                                                          │
│ Success (page 2): {                                          │
│   data: [txn1, txn2, ..., txn21, txn22, ...],  (appended)    │
│   loading: false,                                            │
│   error: null,                                               │
│   nextCursor: "cursor_def" (or null if last page),           │
│   hasMore: true (or false if last page),                     │
│   loadingMore: false                                         │
│ }                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Documents

- [spec.md](./spec.md): Functional requirements and entity definitions
- [research.md](./research.md): Technology decisions (Intl APIs, Fetch, TypeScript patterns)
- [contracts/](./contracts/): API request/response formats
- [plan.md](./plan.md): Implementation plan and architecture