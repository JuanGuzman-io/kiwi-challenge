/**
 * WithdrawScreen component
 * Main withdraw page showing balance, account selector, and submit button
 * Per FR-001-005, FR-014-020: Display title, amount, selector, and button with proper states
 * Per FR-031-034: Manage focus and accessibility
 */

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRewardsSummary } from "../../hooks/useRewardsSummary";
import { useBankAccounts } from "../../hooks/useBankAccounts";
import { AccountSelector } from "./AccountSelector";
import { LoadingState } from "../../../../components/LoadingState";
import { ErrorState } from "../../../../components/ErrorState";
import { formatCurrency } from "../../utils/formatCurrency";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import type { WithdrawLocationState } from "../../types/withdraw.types";
import "../../styles/withdraw.css";

/**
 * Main withdraw screen at /withdraw route
 * Shows balance, account selector, and submit button
 */
export function WithdrawScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isEntering, setIsEntering] = useState(true);

  // Get rewards balance
  const {
    data: summary,
    loading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useRewardsSummary();

  // Get bank accounts for selector state
  const {
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useBankAccounts();

  // Get selected account from router state (FR-031)
  // Using location state directly - component re-renders when location changes
  const locationState = location.state as WithdrawLocationState | null;
  const selectedAccount = locationState?.selectedAccount || null;

  // Per FR-034: Focus management - focus button after account selection
  useEffect(() => {
    if (selectedAccount && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [selectedAccount]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsEntering(false), 180);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Per FR-017, FR-019: Prevent duplicate submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    // Per FR-019: Guard against duplicate submissions
    if (isSubmitting || !selectedAccount) return;

    setIsSubmitting(true);
    // TODO: Implement withdrawal submission in US3
    console.log("Withdrawing to account:", selectedAccount);
  };

  if (isEntering) {
    return (
      <div className="withdraw-screen withdraw-screen--skeleton" aria-live="polite">
        <div className="skeleton skeleton-back"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-amount-label"></div>
        <div className="skeleton skeleton-amount-value"></div>
        <div className="skeleton skeleton-selector"></div>
        <div className="skeleton skeleton-warning"></div>
        <div className="skeleton skeleton-cta"></div>
      </div>
    );
  }

  // Per FR-002, FR-022: Show loading state while fetching balance
  if (balanceLoading) {
    return (
      <div className="withdraw-screen">
        <h1>Elige tu método de retiro</h1>
        <LoadingState type="balance" />
      </div>
    );
  }

  // Per FR-033: Show error state if balance fetch failed
  if (balanceError || !summary) {
    return (
      <div className="withdraw-screen">
        <h1>Elige tu método de retiro</h1>
        <ErrorState
          message={ERROR_MESSAGES.SUMMARY_LOAD_FAILED}
          onRetry={refetchBalance}
        />
      </div>
    );
  }

  // Per FR-003, FR-004: Format withdrawal amount with currency
  const formattedAmount = formatCurrency(summary.balance, summary.currency);

  // Per FR-015-016: Button enabled only when account is selected
  const isButtonDisabled = !selectedAccount || isSubmitting;

  return (
    <div className="withdraw-screen">
      <button
        type="button"
        className="back-button"
        aria-label="Volver a Rewards"
        onClick={() => navigate("/rewards")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929L13.9498 5.63604C14.3403 5.24551 14.9735 5.24551 15.364 5.63604C15.7545 6.02656 15.7545 6.65973 15.364 7.05025L10.4142 12L15.364 16.9497C15.7545 17.3403 15.7545 17.9734 15.364 18.364C14.9735 18.7545 14.3403 18.7545 13.9498 18.364L8.29289 12.7071Z"
            fill="#334155"
          />
        </svg>
      </button>
      {/* Per FR-001: Title */}
      <h1 style={{ height: "32px", fontWeight: "bold" }}>
        {selectedAccount ? "Retirar tus fondos" : "Elige tu método de retiro"}
      </h1>

      {/* Per FR-002-004: Display withdrawal amount */}
      <div className="withdraw-amount-section">
        <label className="amount-label">Monto total a retirar</label>
        <div className="amount-value" aria-label={`Monto: ${formattedAmount}`}>
          {formattedAmount}
        </div>
      </div>

      {/* Per FR-005-013: Account selector */}
      <AccountSelector
        selectedAccount={selectedAccount}
        loading={accountsLoading}
        error={accountsError}
        onRetry={refetchAccounts}
      />

      <div className="withdraw-footer">
        <div className="withdraw-warning-card" role="note">
          <img
            src="/src/assets/brake-warning-llustration.png"
            alt="Advertencia"
            className="withdraw-warning-icon"
            width={32}
            height={32}
          />
          <p className="withdraw-warning-text">
            <strong>Debes esperar unos minutos </strong>
            antes de realizar otro retiro con el mismo monto.
          </p>
        </div>

        {/* Per FR-014-020: Primary action button */}
        <button
          ref={buttonRef}
          className={`primary-action-button ${
            isButtonDisabled ? "disabled" : "enabled"
          }`}
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          aria-label="Retirar fondos"
          aria-disabled={isButtonDisabled}
          type="button"
        >
          {isSubmitting ? "Procesando..." : "Retirar fondos"}
        </button>
      </div>
    </div>
  );
}
