/**
 * AccountList component
 * Displays list of user's bank accounts for selection
 * Per FR-106-113: Fetch and display available accounts, handle selection
 * Per FR-021-027: Handle loading, error, and empty states
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBankAccounts } from '../../hooks/useBankAccounts';
import { LoadingState } from '../../../../components/LoadingState';
import { ErrorState } from '../../../../components/ErrorState';
import { EmptyState } from '../../../../components/EmptyState';
import { AccountListItem } from './AccountListItem';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
import type { BankAccount } from '../../types/bankAccount.types';
import '../../styles/withdraw.css';

/**
 * Full-page account selection list
 * Fetches accounts from API and allows user to select one
 */
export function AccountList() {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { accounts, loading, error, refetch } = useBankAccounts();

  // Per FR-032: Focus management - focus title when page loads
  useEffect(() => {
    if (titleRef.current && !loading) {
      titleRef.current.focus();
    }
  }, [loading]);

  const handleSelectAccount = (account: BankAccount) => {
    // Per FR-012, FR-113: Navigate back to /withdraw with selected account in state
    navigate('/withdraw', {
      state: {
        selectedAccount: account,
      },
    });
  };

  // Per FR-021: Show loading state while fetching accounts
  if (loading) {
    return (
      <div className="account-list-page">
        <h1 ref={titleRef} tabIndex={-1}>Cuentas Bancarias</h1>
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
        <h1 ref={titleRef} tabIndex={-1}>Cuentas Bancarias</h1>
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
        <h1 ref={titleRef} tabIndex={-1}>Cuentas Bancarias</h1>
        <EmptyState message={ERROR_MESSAGES.NO_BANK_ACCOUNTS} />
      </div>
    );
  }

  // Per FR-109-111: Display list of accounts, each selectable
  return (
    <div className="account-list-page">
      <h1 ref={titleRef} tabIndex={-1} >Elige tu método de retiro</h1>
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
