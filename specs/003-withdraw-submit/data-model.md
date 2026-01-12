# Data Model: Submit Withdrawal and Success Confirmation

**Feature**: 003-withdraw-submit | **Date**: 2026-01-11
**Status**: Phase 1 - Design

## Overview

This document defines the data entities, types, and state shapes for the withdrawal submission and success confirmation feature. All types are TypeScript interfaces for frontend type safety.

## Core Entities

### Withdrawal Request

Represents the payload sent to POST /withdrawals to initiate a withdrawal.

```typescript
interface WithdrawalRequest {
  userId: string;         // UUID of the authenticated user
  amount: number;         // Withdrawal amount (must match current balance)
  bankAccountId: string;  // UUID of the selected bank account
  currency: string;       // Currency code (e.g., "USD", "MXN")
}
```

**Usage**: Created in `useWithdrawalSubmit` hook, sent to `submitWithdrawal()` API client.

**Validation**:
- `userId`: Must be valid UUID (from authentication context)
- `amount`: Must be positive number, typically equals full balance
- `bankAccountId`: Must match one of the user's linked accounts
- `currency`: Must match the rewards balance currency

**Example**:
```json
{
  "userId": "user-001",
  "amount": 1234.56,
  "bankAccountId": "bank-account-001",
  "currency": "USD"
}
```

---

### Withdrawal Response

Represents the successful response from POST /withdrawals.

```typescript
interface WithdrawalResponse {
  id: string;             // UUID of the created withdrawal
  userId: string;         // UUID of the user (echoed from request)
  amount: number;         // Withdrawal amount (echoed from request)
  bankAccountId: string;  // UUID of the bank account (echoed from request)
  currency: string;       // Currency code (echoed from request)
  status: string;         // Withdrawal status (e.g., "pending", "processing")
  createdAt: string;      // ISO 8601 timestamp of creation
}
```

**Usage**: Returned by `submitWithdrawal()` API client, passed to success screen via navigation state.

**Status Values**:
- `"pending"`: Withdrawal created, awaiting backend processing
- `"processing"`: Withdrawal is being processed by payment system
- `"completed"`: Withdrawal successfully transferred (not used in this feature)
- `"failed"`: Withdrawal failed (not used in this feature)

**Example**:
```json
{
  "id": "withdrawal-001",
  "userId": "user-001",
  "amount": 1234.56,
  "bankAccountId": "bank-account-001",
  "currency": "USD",
  "status": "pending",
  "createdAt": "2026-01-11T20:00:00.000Z"
}
```

---

### Problem Details Error

Represents the error response format from POST /withdrawals (RFC 7807).

```typescript
interface ProblemDetails {
  type: string;           // Error category URL (e.g., "bank-account-not-found")
  title: string;          // Human-readable error title
  status: number;         // HTTP status code (400, 404, 500, etc.)
  detail: string;         // User-facing error message (displayed in UI)
  instance: string;       // API endpoint path (e.g., "/withdrawals")
  bankAccountId?: string; // Optional context for bank account errors
}
```

**Usage**: Thrown by `submitWithdrawal()` on error, caught in `useWithdrawalSubmit` hook, displayed inline in footer.

**Common Error Types**:
- `"bank-account-not-found"`: Selected account deleted or inaccessible (status 404)
- `"insufficient-balance"`: Balance changed since screen load (status 400)
- `"cooldown-active"`: User submitted withdrawal too recently (status 429)
- `"server-error"`: Backend failure (status 500)

**Example (404 - Bank Account Not Found)**:
```json
{
  "type": "https://api.example.com/errors/bank-account-not-found",
  "title": "Bank Account Not Found",
  "status": 404,
  "detail": "The specified bank account does not exist or is not accessible",
  "instance": "/withdrawals",
  "bankAccountId": "bank-account-001"
}
```

**Example (429 - Cooldown Active)**:
```json
{
  "type": "https://api.example.com/errors/cooldown-active",
  "title": "Cooldown Active",
  "status": 429,
  "detail": "You must wait a few minutes before making another withdrawal with the same amount",
  "instance": "/withdrawals"
}
```

---

## Navigation State Shapes

### Withdraw Success Location State

Represents the data passed from /withdraw to /withdraw/success via React Router navigation state.

```typescript
interface WithdrawSuccessLocationState {
  withdrawalData: {
    id: string;             // Withdrawal UUID (from WithdrawalResponse)
    bankAccountId: string;  // Bank account UUID (from WithdrawalResponse)
    amount: number;         // Withdrawal amount (from WithdrawalResponse)
    currency: string;       // Currency code (from WithdrawalResponse)
    status: string;         // Withdrawal status (from WithdrawalResponse)
    createdAt: string;      // ISO timestamp (from WithdrawalResponse)
    lastFourDigits: string; // Account last 4 digits (from selectedAccount, NOT from API)
  };
}
```

**Usage**: Passed in `navigate('/withdraw/success', { state: ... })`, accessed via `useLocation()` in WithdrawSuccessScreen.

**Important**: `lastFourDigits` is NOT returned by the API. It must be extracted from the `selectedAccount` (BankAccount type from 002-withdraw) before navigation.

**Example**:
```typescript
// In WithdrawScreen.tsx after successful submission
navigate('/withdraw/success', {
  state: {
    withdrawalData: {
      id: response.id,
      bankAccountId: response.bankAccountId,
      amount: response.amount,
      currency: response.currency,
      status: response.status,
      createdAt: response.createdAt,
      lastFourDigits: selectedAccount.lastFourDigits, // From BankAccount entity
    },
  } as WithdrawSuccessLocationState,
});
```

**Guard Pattern**: WithdrawSuccessScreen must check if `withdrawalData` exists, redirect to /withdraw if missing (FR-021).

---

### Withdraw Location State (Existing from 002-withdraw)

For reference, this is the existing state shape from 002-withdraw account selection flow:

```typescript
interface WithdrawLocationState {
  selectedAccount: BankAccount | null;
}

interface BankAccount {
  id: string;             // UUID
  lastFourDigits: string; // Last 4 digits of account number
  accountType: string;    // "Checking", "Savings", etc.
  isActive: boolean;      // Whether account is active
  createdAt: string;      // ISO timestamp
}
```

**Usage**: Passed from /withdraw/accounts to /withdraw when account is selected. Used by WithdrawScreen to display selected account and enable submit button.

---

## Component State

### WithdrawScreen Component State

```typescript
interface WithdrawScreenState {
  isSubmitting: boolean;           // True during API call
  error: ProblemDetails | null;    // Error from failed submission
  selectedAccount: BankAccount | null; // From location.state (002-withdraw)
  summary: RewardsSummary;         // From useRewardsSummary hook (001-rewards-backend)
}

interface RewardsSummary {
  balance: number;
  currency: string;
  // ... other fields from 001-rewards-backend
}
```

**State Transitions**:
1. **Idle**: `isSubmitting=false`, `error=null`, `selectedAccount=...`
2. **Submitting**: `isSubmitting=true`, `error=null` (button disabled, shows "Procesando...")
3. **Error**: `isSubmitting=false`, `error={...}` (error displayed inline, button re-enabled)
4. **Success**: Navigate to /withdraw/success (state cleared)

---

### WithdrawSuccessScreen Component State

```typescript
interface WithdrawSuccessScreenState {
  imageLoaded: boolean; // True if success-check.png loaded successfully
  withdrawalData: WithdrawSuccessLocationState['withdrawalData']; // From location.state
}
```

**State Transitions**:
1. **Loading/Validating**: Check if `withdrawalData` exists
2. **Redirecting**: If no data, show skeleton and redirect to /withdraw
3. **Displaying**: Show success content with account digits

---

## Hook Return Types

### useWithdrawalSubmit Hook

```typescript
interface UseWithdrawalSubmitReturn {
  submitWithdrawal: (request: WithdrawalRequest) => Promise<WithdrawalResponse>;
  isSubmitting: boolean;
  error: ProblemDetails | null;
  clearError: () => void;
}
```

**Usage**:
```typescript
const { submitWithdrawal, isSubmitting, error, clearError } = useWithdrawalSubmit();

const handleSubmit = async () => {
  if (isSubmitting || !selectedAccount) return;

  clearError();
  try {
    const result = await submitWithdrawal({
      userId: 'test-user-001',
      amount: summary.balance,
      bankAccountId: selectedAccount.id,
      currency: summary.currency,
    });

    // Navigate to success with result
    navigate('/withdraw/success', {
      state: {
        withdrawalData: {
          ...result,
          lastFourDigits: selectedAccount.lastFourDigits,
        },
      },
    });
  } catch (err) {
    // Error set automatically by hook
  }
};
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ WithdrawScreen                                              │
│                                                             │
│ 1. User clicks "Retirar fondos"                            │
│ 2. handleSubmit() called                                   │
│ 3. Guard: if (isSubmitting) return                         │
│ 4. setIsSubmitting(true)                                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ submitWithdrawal(WithdrawalRequest)                 │   │
│ │                                                     │   │
│ │ POST /withdrawals                                   │   │
│ │ ├─ Success (200/201): WithdrawalResponse           │   │
│ │ └─ Error (4xx/5xx): ProblemDetails                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ 5a. On success:                                            │
│     - Log [WITHDRAWAL_SUCCESS]                             │
│     - navigate('/withdraw/success', {                      │
│         state: { withdrawalData: {...response, lastFourDigits} } │
│       })                                                   │
│                                                             │
│ 5b. On error:                                              │
│     - Log [WITHDRAWAL_FAILURE]                             │
│     - setError(problemDetails)                             │
│     - setIsSubmitting(false)                               │
│     - Display error inline above button                    │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ navigate()
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ WithdrawSuccessScreen                                       │
│                                                             │
│ 1. useLocation() to get location.state                     │
│ 2. Extract withdrawalData from state                       │
│ 3. Guard: if (!withdrawalData) redirect to /withdraw       │
│ 4. Display:                                                │
│    - Success image (success-check.png or SVG fallback)     │
│    - Title: "¡Tu retiro fue exitoso!"                      │
│    - Description with lastFourDigits                       │
│    - "Regresar a Rewards" button                           │
│                                                             │
│ 5. User clicks "Regresar a Rewards"                        │
│    - navigate('/rewards')                                  │
│    - Refetch rewards summary                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Type Exports

All types should be exported from `src/features/rewards/types/withdrawal.types.ts`:

```typescript
// withdrawal.types.ts
export interface WithdrawalRequest {
  userId: string;
  amount: number;
  bankAccountId: string;
  currency: string;
}

export interface WithdrawalResponse {
  id: string;
  userId: string;
  amount: number;
  bankAccountId: string;
  currency: string;
  status: string;
  createdAt: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  bankAccountId?: string;
}

export interface WithdrawSuccessLocationState {
  withdrawalData: {
    id: string;
    bankAccountId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    lastFourDigits: string; // NOT from API, from selectedAccount
  };
}
```

---

## Validation Rules

### WithdrawalRequest Validation (Client-Side)

- `userId`: Non-empty string, valid UUID format
- `amount`: Positive number, must equal current balance from useRewardsSummary
- `bankAccountId`: Non-empty string, valid UUID, must match a BankAccount.id
- `currency`: Non-empty string, must match balance currency

**Note**: Server-side validation is assumed (out of scope for this feature).

### WithdrawalResponse Validation (Client-Side)

- `id`: Non-empty string (UUID expected but not validated)
- `status`: Non-empty string (typically "pending" or "processing")
- `createdAt`: Valid ISO 8601 timestamp string

**Note**: Frontend uses response data as-is, no transformation required.

### ProblemDetails Validation (Client-Side)

- `detail`: Non-empty string (used for user-facing error message)
- `status`: Number (HTTP status code)

**Note**: Frontend only displays `detail` field, other fields used for logging.

---

## Related Entities (from 002-withdraw)

### BankAccount (Reference)

Already defined in `src/features/rewards/types/bankAccount.types.ts` from 002-withdraw:

```typescript
export interface BankAccount {
  id: string;
  lastFourDigits: string;
  accountType: string;
  isActive: boolean;
  createdAt: string;
}

export interface BankAccountsResponse {
  accounts: BankAccount[];
  count: number;
}
```

**Usage in 003-withdraw-submit**: The `lastFourDigits` field is extracted from the selected BankAccount and included in the navigation state for display on the success screen.

---

## Summary

**New Types Created**: 4
- WithdrawalRequest (API payload)
- WithdrawalResponse (API response)
- ProblemDetails (error response)
- WithdrawSuccessLocationState (navigation state)

**Existing Types Used**: 2
- BankAccount (from 002-withdraw)
- RewardsSummary (from 001-rewards-backend)

**Type Safety**: All entities are fully typed with TypeScript interfaces for compile-time validation and IDE autocomplete support.
