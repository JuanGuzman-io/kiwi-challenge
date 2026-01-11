# API Contracts: Rewards Overview (Rewards Home)

**Feature**: 001-rewards-home
**Date**: 2026-01-11
**Context**: Frontend integration with backend rewards APIs

## Overview

This directory documents the API contracts between the Rewards Overview frontend feature and the existing backend rewards APIs. These contracts define the request/response formats that the frontend expects.

**Note**: This is a frontend-only feature that **consumes** existing backend APIs. The actual API implementation is defined in the `001-rewards-backend` spec and is out of scope for this document. These contracts serve as integration specifications for frontend development and testing.

---

## API Endpoints

### 1. GET /rewards/summary

Fetches the user's current accumulated rewards balance.

**Purpose**: Display balance in BalanceSummaryCard component (FR-002, FR-003, FR-022)

#### Request

```http
GET /rewards/summary HTTP/1.1
Host: api.example.com
x-user-id: user_abc123
Content-Type: application/json
```

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `x-user-id` | Yes | Authenticated user identifier (FR-021) |

**Query Parameters**: None

**Request Body**: None

#### Response

**Success (200 OK)**:
```json
{
  "balance": 1234.56,
  "currency": "USD"
}
```

**Response Schema**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `balance` | number | Yes | User's accumulated balance | >= 0 |
| `currency` | string | Yes | ISO 4217 currency code | 3 uppercase letters |

**Example Responses**:

Positive balance:
```json
{
  "balance": 525.75,
  "currency": "USD"
}
```

Zero balance:
```json
{
  "balance": 0.00,
  "currency": "USD"
}
```

#### Error Responses

**401 Unauthorized** (missing or invalid x-user-id):
```json
{
  "type": "https://api.example.com/problems/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Missing or invalid x-user-id header"
}
```

**500 Internal Server Error**:
```json
{
  "type": "https://api.example.com/problems/internal-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred"
}
```

**504 Gateway Timeout** (exceeds 5-second threshold):
```json
{
  "type": "https://api.example.com/problems/timeout",
  "title": "Gateway Timeout",
  "status": 504,
  "detail": "Request exceeded timeout threshold"
}
```

#### Frontend Timeout Handling

Per clarification and FR-053, the frontend implements a client-side 5-second timeout:

```typescript
// Client-side timeout (AbortController)
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch('/rewards/summary', {
    signal: controller.signal,
    headers: { 'x-user-id': userId }
  });
  clearTimeout(timeout);
  // ... handle response
} catch (error) {
  clearTimeout(timeout);
  if (error.name === 'AbortError') {
    // Show error: "No pudimos cargar tu balance. Por favor, intenta de nuevo."
    throw new TimeoutError();
  }
  throw error;
}
```

#### Related Requirements
- FR-022: Fetch balance and currency from GET /rewards/summary
- FR-033: Display error message with retry action when summary API fails or exceeds 5-second timeout
- FR-053: Implement 5-second timeout for all API requests
- Clarification: 5-second timeout threshold

---

### 2. GET /rewards/transactions

Fetches paginated user transaction history with cursor-based pagination.

**Purpose**: Display transaction history in TransactionList component (FR-005, FR-006, FR-023)

#### Request

```http
GET /rewards/transactions?limit=20&cursor=cursor_abc123 HTTP/1.1
Host: api.example.com
x-user-id: user_abc123
Content-Type: application/json
```

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `x-user-id` | Yes | Authenticated user identifier (FR-021) |

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | Number of transactions per page (max 100) |
| `cursor` | string | No | null | Cursor for next page (from previous response's `nextCursor`) |

**Request Body**: None

#### Response

**Success (200 OK)**:
```json
{
  "transactions": [
    {
      "id": "txn_001",
      "type": "CASHBACK",
      "amount": 25.50,
      "description": "Cashback on purchase #12345",
      "createdAt": "2025-09-15T14:30:00Z"
    },
    {
      "id": "txn_002",
      "type": "WITHDRAWAL",
      "amount": -10.00,
      "description": "Withdrawal to Bank Account ****1234",
      "createdAt": "2025-09-10T10:15:00Z"
    },
    {
      "id": "txn_003",
      "type": "REFERRAL_BONUS",
      "amount": 15.00,
      "description": "Referral bonus for inviting user@example.com",
      "createdAt": "2025-08-28T16:45:00Z"
    }
  ],
  "nextCursor": "cursor_xyz789",
  "hasMore": true,
  "count": 127
}
```

**Response Schema**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `transactions` | Transaction[] | Yes | Array of transactions for current page | May be empty |
| `nextCursor` | string \| null | Yes | Cursor for next page (null if no more pages) | Opaque string |
| `hasMore` | boolean | Yes | Whether more transactions exist | Must match nextCursor presence |
| `count` | integer | No | Total transaction count (optional) | >= 0 |

**Transaction Schema**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Unique transaction identifier | Non-empty |
| `type` | enum | Yes | Transaction type | One of: CASHBACK, REFERRAL_BONUS, WITHDRAWAL, INCOME |
| `amount` | number | Yes | Signed amount (+ for incoming, - for outgoing) | Non-zero |
| `description` | string | Yes | Human-readable description | Non-empty |
| `createdAt` | string | Yes | ISO 8601 timestamp | Valid datetime |

**Example Responses**:

First page (has more):
```json
{
  "transactions": [/* 20 transactions */],
  "nextCursor": "cursor_page2",
  "hasMore": true,
  "count": 127
}
```

Last page (no more):
```json
{
  "transactions": [/* 7 transactions */],
  "nextCursor": null,
  "hasMore": false,
  "count": 127
}
```

Empty history:
```json
{
  "transactions": [],
  "nextCursor": null,
  "hasMore": false,
  "count": 0
}
```

#### Pagination Flow

1. **Initial Request**: `GET /rewards/transactions?limit=20`
   - Returns first 20 transactions + `nextCursor`

2. **Load More**: `GET /rewards/transactions?limit=20&cursor=cursor_page2`
   - Returns next 20 transactions + new `nextCursor`
   - Frontend **appends** to existing transactions (FR-017)

3. **Final Page**: `GET /rewards/transactions?limit=20&cursor=cursor_page5`
   - Returns remaining transactions + `nextCursor: null`, `hasMore: false`
   - Frontend hides/disables "Load more" button (FR-019)

#### Error Responses

**400 Bad Request** (invalid cursor):
```json
{
  "type": "https://api.example.com/problems/invalid-cursor",
  "title": "Invalid Cursor",
  "status": 400,
  "detail": "The provided cursor is invalid or expired"
}
```

**401 Unauthorized** (missing or invalid x-user-id):
```json
{
  "type": "https://api.example.com/problems/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Missing or invalid x-user-id header"
}
```

**500 Internal Server Error**:
```json
{
  "type": "https://api.example.com/problems/internal-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred"
}
```

**504 Gateway Timeout** (exceeds 5-second threshold):
```json
{
  "type": "https://api.example.com/problems/timeout",
  "title": "Gateway Timeout",
  "status": 504,
  "detail": "Request exceeded timeout threshold"
}
```

#### Frontend Timeout Handling

Per clarification and FR-053, the frontend implements a client-side 5-second timeout for all paginated requests (initial and "load more"):

```typescript
// Client-side timeout for pagination requests
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const url = cursor
    ? `/rewards/transactions?limit=20&cursor=${cursor}`
    : `/rewards/transactions?limit=20`;

  const response = await fetch(url, {
    signal: controller.abort Signal,
    headers: { 'x-user-id': userId }
  });
  clearTimeout(timeout);
  // ... handle response
} catch (error) {
  clearTimeout(timeout);
  if (error.name === 'AbortError') {
    // Show error: "No pudimos cargar tus transacciones. Por favor, intenta de nuevo."
    throw new TimeoutError();
  }
  throw error;
}
```

#### Related Requirements
- FR-023: Fetch paginated transaction history from GET /rewards/transactions
- FR-024: Use cursor-based pagination for transaction history to ensure consistency
- FR-034: Display error message with retry action when transactions API fails or exceeds 5-second timeout
- FR-053: Implement 5-second timeout for all API requests
- Clarification: 5-second timeout threshold

---

## Error Response Format (RFC 7807)

All error responses follow RFC 7807 Problem Details format (assumed based on backend patterns in 001-rewards-backend spec).

**Standard Error Structure**:
```json
{
  "type": "https://api.example.com/problems/{error-type}",
  "title": "Human-readable error title",
  "status": 400,
  "detail": "Detailed error description",
  "instance": "/rewards/summary",
  "timestamp": "2025-09-15T14:30:00Z"
}
```

**Frontend Error Mapping**:

| Backend Status | Frontend Message (Spanish) | User Action |
|----------------|----------------------------|-------------|
| 400 Bad Request | "Hubo un problema con tu solicitud. Por favor, intenta de nuevo." | Retry button |
| 401 Unauthorized | "Tu sesión ha expirado. Por favor, inicia sesión nuevamente." | Redirect to login |
| 404 Not Found | "No pudimos encontrar la información solicitada." | Retry button |
| 500 Internal Server Error | "Algo salió mal. Por favor, intenta de nuevo más tarde." | Retry button |
| 504 Gateway Timeout | "[Timeout message from clarification]" | Retry button |
| Network Error (no response) | "Parece que hay un problema de conexión. Por favor, verifica tu internet." | Retry button |

Per clarification, error messages use user-friendly Spanish with retry actions (e.g., "No pudimos cargar tu balance. Por favor, intenta de nuevo.").

---

## Authentication & Authorization

### Header Requirement (FR-021)

All API requests MUST include the `x-user-id` header:

```typescript
const headers = {
  'x-user-id': getUserId(), // From authentication context
  'Content-Type': 'application/json',
};
```

### User Context

The `x-user-id` value is obtained from the application's authentication context (assumption A-001: "Users are already authenticated, and x-user-id is available from authentication context").

**Implementation Pattern**:
```typescript
// client/src/context/AuthContext.tsx (assumed to exist)
export function useAuth() {
  const context = useContext(AuthContext);
  return context.userId; // Returns x-user-id value
}

// Usage in API client
import { useAuth } from '@/context/AuthContext';

const userId = useAuth();
const response = await fetch('/rewards/summary', {
  headers: { 'x-user-id': userId }
});
```

---

## Mock Service Worker (MSW) Handlers

For local development and testing, MSW handlers mock these API endpoints:

```typescript
// client/tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET /rewards/summary
  http.get('/rewards/summary', ({ request }) => {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return HttpResponse.json(
        { type: 'unauthorized', title: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      balance: 1234.56,
      currency: 'USD',
    });
  }),

  // GET /rewards/transactions
  http.get('/rewards/transactions', ({ request }) => {
    const userId = request.headers.get('x-user-id');
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    if (!userId) {
      return HttpResponse.json(
        { type: 'unauthorized', title: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Mock paginated response
    const page1 = [/* first 20 transactions */];
    const page2 = [/* next 20 transactions */];

    if (!cursor) {
      return HttpResponse.json({
        transactions: page1,
        nextCursor: 'cursor_page2',
        hasMore: true,
        count: 127,
      });
    } else if (cursor === 'cursor_page2') {
      return HttpResponse.json({
        transactions: page2,
        nextCursor: null,
        hasMore: false,
        count: 127,
      });
    }
  }),
];
```

---

## Base URL Configuration

API base URL is configured via environment variable:

```typescript
// client/src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Usage
const response = await fetch(`${API_BASE_URL}/rewards/summary`, options);
```

**Environment Files**:
```bash
# client/.env.development
VITE_API_BASE_URL=http://localhost:3000

# client/.env.production
VITE_API_BASE_URL=https://api.production.com
```

---

## Related Documents

- [data-model.md](../data-model.md): Frontend TypeScript types for API responses
- [spec.md](../spec.md): Functional requirements for API integration
- [research.md](../research.md): Technology decisions (Fetch API, timeout handling)
- [quickstart.md](../quickstart.md): Local development setup and testing procedures
