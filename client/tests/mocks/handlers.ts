/**
 * MSW (Mock Service Worker) handlers for API endpoints
 * Used for local development and testing
 * Based on contracts/README.md from 001-rewards-home spec
 */

import { http, HttpResponse } from 'msw';

// Mock data
const mockSummary = {
  balance: 1234.56,
  currency: 'USD',
};

const mockTransactions = [
  {
    id: 'txn_001',
    type: 'CASHBACK',
    amount: 25.50,
    description: 'Cashback on purchase #12345',
    createdAt: '2025-09-15T14:30:00Z',
  },
  {
    id: 'txn_002',
    type: 'WITHDRAWAL',
    amount: -10.00,
    description: 'Withdrawal to Bank Account ****1234',
    createdAt: '2025-09-10T10:15:00Z',
  },
  {
    id: 'txn_003',
    type: 'REFERRAL_BONUS',
    amount: 15.00,
    description: 'Referral bonus for inviting user@example.com',
    createdAt: '2025-08-28T16:45:00Z',
  },
  {
    id: 'txn_004',
    type: 'CASHBACK',
    amount: 12.25,
    description: 'Cashback on purchase #12346',
    createdAt: '2025-08-15T09:20:00Z',
  },
  {
    id: 'txn_005',
    type: 'INCOME',
    amount: 50.00,
    description: 'Bonus credit',
    createdAt: '2025-07-30T11:00:00Z',
  },
];

export const handlers = [
  // GET /rewards/summary
  http.get('/rewards/summary', ({ request }) => {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return HttpResponse.json(
        {
          type: 'https://api.example.com/problems/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Missing or invalid x-user-id header',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json(mockSummary);
  }),

  // GET /rewards/transactions
  http.get('/rewards/transactions', ({ request }) => {
    const userId = request.headers.get('x-user-id');
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    if (!userId) {
      return HttpResponse.json(
        {
          type: 'https://api.example.com/problems/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Missing or invalid x-user-id header',
        },
        { status: 401 }
      );
    }

    // First page
    if (!cursor) {
      const firstPage = mockTransactions.slice(0, Math.min(limit, 3));
      return HttpResponse.json({
        transactions: firstPage,
        nextCursor: mockTransactions.length > 3 ? 'cursor_page2' : null,
        hasMore: mockTransactions.length > 3,
        count: mockTransactions.length,
      });
    }

    // Second page
    if (cursor === 'cursor_page2') {
      const secondPage = mockTransactions.slice(3);
      return HttpResponse.json({
        transactions: secondPage,
        nextCursor: null,
        hasMore: false,
        count: mockTransactions.length,
      });
    }

    // Invalid cursor
    return HttpResponse.json(
      {
        type: 'https://api.example.com/problems/invalid-cursor',
        title: 'Invalid Cursor',
        status: 400,
        detail: 'The provided cursor is invalid or expired',
      },
      { status: 400 }
    );
  }),

  // GET /bank-accounts - Success response
  http.get('/bank-accounts', ({ request }) => {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return HttpResponse.json(
        {
          type: 'https://api.example.com/problems/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Missing or invalid x-user-id header',
        },
        { status: 401 }
      );
    }

    // Success response with multiple accounts
    return HttpResponse.json({
      accounts: [
        {
          id: 'bank-account-002',
          lastFourDigits: '4321',
          accountType: 'Savings',
          isActive: true,
          createdAt: '2026-01-11T17:49:07.091Z',
        },
        {
          id: 'bank-account-001',
          lastFourDigits: '7890',
          accountType: 'Checking',
          isActive: true,
          createdAt: '2026-01-11T17:49:07.082Z',
        },
      ],
      count: 2,
    });
  }),
];
