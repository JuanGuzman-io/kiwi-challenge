/**
 * Spanish error messages for rewards feature
 * Per clarification: User-friendly Spanish error messages with retry actions
 * Per FR-033, FR-034: Error messages for summary and transactions API failures
 */

export const ERROR_MESSAGES = {
  /**
   * Error message when GET /rewards/summary fails or times out
   * Per FR-033
   */
  SUMMARY_LOAD_FAILED: 'No pudimos cargar tu balance. Por favor, intenta de nuevo.',

  /**
   * Error message when GET /rewards/transactions fails or times out
   * Per FR-034
   */
  TRANSACTIONS_LOAD_FAILED: 'No pudimos cargar tus transacciones. Por favor, intenta de nuevo.',

  /**
   * Error message for network errors (no response from server)
   */
  NETWORK_ERROR: 'Parece que hay un problema de conexión. Por favor, verifica tu internet.',

  /**
   * Error message for timeout errors (exceeds 5-second threshold)
   * Per FR-053, clarification
   */
  TIMEOUT: 'La solicitud tardó demasiado. Por favor, intenta de nuevo.',

  /**
   * Error message when GET /bank-accounts fails or times out
   * Per FR-024: Clear error message in Spanish for account fetch failures
   */
  BANK_ACCOUNTS_LOAD_FAILED: 'No pudimos cargar tus cuentas bancarias. Por favor, intenta de nuevo.',

  /**
   * Empty state message when user has no linked bank accounts
   * Per edge case handling in spec
   */
  NO_BANK_ACCOUNTS: 'No tienes cuentas bancarias vinculadas',
} as const;
