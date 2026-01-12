/**
 * Additional MSW handlers for bank accounts testing
 * Includes error scenarios and empty state
 * Used in specific tests by importing and overriding default handlers
 */

import { http, HttpResponse } from 'msw';

/**
 * Handler for 500 Internal Server Error scenario
 * Use in tests: server.use(bankAccountsErrorHandler)
 */
export const bankAccountsErrorHandler = http.get('/bank-accounts', () => {
  return HttpResponse.json(
    {
      type: 'https://api.example.com/problems/internal-server-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred while fetching bank accounts',
    },
    { status: 500 }
  );
});

/**
 * Handler for 401 Unauthorized scenario
 * Use in tests: server.use(bankAccountsUnauthorizedHandler)
 */
export const bankAccountsUnauthorizedHandler = http.get('/bank-accounts', () => {
  return HttpResponse.json(
    {
      type: 'https://api.example.com/problems/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing or invalid x-user-id header',
    },
    { status: 401 }
  );
});

/**
 * Handler for empty accounts response
 * Use in tests: server.use(bankAccountsEmptyHandler)
 */
export const bankAccountsEmptyHandler = http.get('/bank-accounts', () => {
  return HttpResponse.json({
    accounts: [],
    count: 0,
  });
});

/**
 * Handler for response with 50 accounts (performance testing)
 * Use in tests: server.use(bankAccounts50Handler)
 */
export const bankAccounts50Handler = http.get('/bank-accounts', () => {
  const accounts = Array.from({ length: 50 }, (_, i) => ({
    id: `bank-account-${String(i + 1).padStart(3, '0')}`,
    lastFourDigits: String(1000 + i).slice(-4),
    accountType: i % 2 === 0 ? 'Checking' : 'Savings',
    isActive: true,
    createdAt: new Date(2026, 0, 11 - i).toISOString(),
  }));

  return HttpResponse.json({
    accounts,
    count: 50,
  });
});
