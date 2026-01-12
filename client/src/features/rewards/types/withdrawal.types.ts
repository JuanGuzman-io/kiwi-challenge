/**
 * Type definitions for withdrawal submission and success confirmation feature (003-withdraw-submit)
 * Based on data-model.md from specs/003-withdraw-submit/
 */

/**
 * Payload sent to POST /withdrawals to initiate a withdrawal
 */
export interface WithdrawalRequest {
  amount: number;         // Withdrawal amount (must match current balance)
  bankAccountId: string;  // UUID of the selected bank account
  currency: string;       // Currency code (e.g., "USD", "MXN")
}

/**
 * Successful response from POST /withdrawals
 */
export interface WithdrawalResponse {
  id: string;             // UUID of the created withdrawal
  userId: string;         // UUID of the user (echoed from request)
  amount: number;         // Withdrawal amount (echoed from request)
  bankAccountId: string;  // UUID of the bank account (echoed from request)
  currency: string;       // Currency code (echoed from request)
  status: string;         // Withdrawal status (e.g., "pending", "processing")
  createdAt: string;      // ISO 8601 timestamp of creation
}

/**
 * Error response format from POST /withdrawals (RFC 7807 Problem Details)
 */
export interface ProblemDetails {
  type: string;           // Error category URL (e.g., "bank-account-not-found")
  title: string;          // Human-readable error title
  status: number;         // HTTP status code (400, 404, 500, etc.)
  detail: string;         // User-facing error message (displayed in UI)
  instance: string;       // API endpoint path (e.g., "/withdrawals")
  bankAccountId?: string; // Optional context for bank account errors
}

/**
 * Data passed from /withdraw to /withdraw/success via React Router navigation state
 * Note: lastFourDigits is NOT from API - must be extracted from selectedAccount (BankAccount)
 */
export interface WithdrawSuccessLocationState {
  withdrawalData: {
    id: string;             // Withdrawal UUID (from WithdrawalResponse)
    bankAccountId: string;  // Bank account UUID (from WithdrawalResponse)
    amount: number;         // Withdrawal amount (from WithdrawalResponse)
    currency: string;       // Currency code (from WithdrawalResponse)
    status: string;         // Withdrawal status (from WithdrawalResponse)
    createdAt: string;      // ISO timestamp (from WithdrawalResponse)
    lastFourDigits: string; // Account last 4 digits (from selectedAccount, NOT API)
  };
}
