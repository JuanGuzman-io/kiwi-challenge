/**
 * AccountSelector component
 * Displays account selector control on withdraw screen
 * Per FR-043-045: Visually identifiable selector showing placeholder or selected account
 * Per FR-021-027: Handle loading and error states with appropriate UI
 */

import { useNavigate } from 'react-router-dom';
import { ErrorState } from '../../../../components/ErrorState';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
import type { BankAccount } from '../../types/bankAccount.types';

interface AccountSelectorProps {
  /**
   * Currently selected bank account (null if none selected)
   */
  selectedAccount: BankAccount | null;

  /**
   * Loading state for account fetching
   */
  loading?: boolean;

  /**
   * Error from account fetching
   */
  error?: Error | null;

  /**
   * Retry callback for error state
   */
  onRetry?: () => void;
}

/**
 * Account selector control that navigates to account selection screen
 * Shows placeholder, selected account, loading, or error state
 */
export function AccountSelector({
  selectedAccount,
  loading = false,
  error = null,
  onRetry,
}: AccountSelectorProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Per FR-006: Navigate to /withdraw/accounts when selector is clicked
    navigate('/withdraw/accounts');
  };

  // Per FR-021: Show loading state while fetching accounts
  if (loading) {
    return (
      <div className="account-selector loading">
        <div role="status" aria-live="polite" aria-label="Cargando cuentas">
          <div className="skeleton skeleton-selector"></div>
        </div>
      </div>
    );
  }

  // Per FR-024-027: Show error state if accounts failed to load
  if (error && onRetry) {
    return (
      <div className="account-selector error">
        <ErrorState
          message={ERROR_MESSAGES.BANK_ACCOUNTS_LOAD_FAILED}
          onRetry={onRetry}
        />
      </div>
    );
  }

  // Per FR-044: Show placeholder "Selecciona una cuenta" when no account selected
  const displayText = selectedAccount
    ? `•••• ${selectedAccount.lastFourDigits}`
    : 'Seleccionar';

  // Per FR-031: Provide accessible label
  const ariaLabel = selectedAccount
    ? `Cuenta seleccionada: ${selectedAccount.accountType} terminada en ${selectedAccount.lastFourDigits}. Toca para cambiar.`
    : 'Selecciona una cuenta bancaria';

  return (
    <div className="account-selector">
      <label htmlFor="account-selector-button" className="selector-label">
        Selecciona tu método del retiro
      </label>
      <button
        id="account-selector-button"
        className="selector-button"
        onClick={handleClick}
        aria-label={ariaLabel}
        type="button"
      >
        <span className="selector-leading">
          <span className="selector-icon-card" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect
                x="3"
                y="6"
                width="18"
                height="12"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M3 10h18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </span>
          <span className="selector-text">{displayText}</span>
        </span>
        <span className="selector-icon" aria-hidden="true">
          ›
        </span>
      </button>
    </div>
  );
}
