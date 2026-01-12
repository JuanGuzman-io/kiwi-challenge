/**
 * AccountList component
 * Displays list of user's bank accounts for selection
 * Per FR-106-113: Fetch and display available accounts, handle selection
 * Per FR-021-027: Handle loading, error, and empty states
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBankAccounts } from "../../hooks/useBankAccounts";
import { LoadingState } from "../../../../components/LoadingState";
import { ErrorState } from "../../../../components/ErrorState";
import { EmptyState } from "../../../../components/EmptyState";
import { AccountListItem } from "./AccountListItem";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import type { BankAccount } from "../../types/bankAccount.types";
import "../../styles/withdraw.css";

/**
 * Full-page account selection list
 * Fetches accounts from API and allows user to select one
 */
export function AccountList() {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isEntering, setIsEntering] = useState(true);
  const { accounts, loading, error, refetch } = useBankAccounts();

  // Per FR-032: Focus management - focus title when page loads
  useEffect(() => {
    if (titleRef.current && !loading) {
      titleRef.current.focus();
    }
  }, [loading]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsEntering(false), 180);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleSelectAccount = (account: BankAccount) => {
    // Per FR-012, FR-113: Navigate back to /withdraw with selected account in state
    navigate("/withdraw", {
      state: {
        selectedAccount: account,
      },
    });
  };

  if (isEntering) {
    return (
      <div className="account-list-page account-list-page--skeleton" aria-live="polite">
        <div className="skeleton skeleton-back"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-account-item"></div>
        <div className="skeleton skeleton-account-item"></div>
        <div className="skeleton skeleton-account-item"></div>
      </div>
    );
  }

  // Per FR-021: Show loading state while fetching accounts
  if (loading) {
    return (
      <div className="account-list-page">
        <h1 ref={titleRef} tabIndex={-1}>
          Cuentas Bancarias
        </h1>
        <div role="status" aria-live="polite" aria-label="Cargando cuentas">
          <LoadingState type="transactions" />
        </div>
      </div>
    );
  }

  // Per FR-024-027: Show error state if fetch failed
  if (error) {
    return (
      <div className="account-list-page">
        <h1 ref={titleRef} tabIndex={-1}>
          Cuentas Bancarias
        </h1>
        <ErrorState
          message={ERROR_MESSAGES.BANK_ACCOUNTS_LOAD_FAILED}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Per edge case: Show empty state if no accounts
  if (accounts.length === 0) {
    return (
      <div className="account-list-page">
        <h1 ref={titleRef} tabIndex={-1}>
          Cuentas Bancarias
        </h1>
        <EmptyState message={ERROR_MESSAGES.NO_BANK_ACCOUNTS} />
      </div>
    );
  }

  // Per FR-109-111: Display list of accounts, each selectable
  return (
    <div className="account-list-page">
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
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929L13.9498 5.63604C14.3403 5.24551 14.9735 5.24551 15.364 5.63604C15.7545 6.02656 15.7545 6.65973 15.364 7.05025L10.4142 12L15.364 16.9497C15.7545 17.3403 15.7545 17.9734 15.364 18.364C14.9735 18.7545 14.3403 18.7545 13.9498 18.364L8.29289 12.7071Z"
            fill="#334155"
          />
        </svg>
      </button>
      <h1 ref={titleRef} tabIndex={-1}>
        Elige tu método de retiro
      </h1>
      <div className="account-list" role="list">
        {accounts.map((account) => (
          <div key={account.id} role="listitem">
            <AccountListItem account={account} onSelect={handleSelectAccount} />
          </div>
        ))}
      </div>
    </div>
  );
}
