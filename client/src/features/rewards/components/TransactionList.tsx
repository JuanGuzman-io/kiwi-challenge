/**
 * TransactionList component
 * Per FR-005, FR-006: Display transaction history grouped by month
 * Per FR-007: Display transactions newest-first
 * Per FR-026: Display skeleton loader while loading
 * Per FR-028: Display empty state when no transactions
 * Per FR-034: Display error message with retry action on API failure
 */

import { useMemo } from 'react';
import { useRewardsTransactions } from '../hooks/useRewardsTransactions';
import { groupTransactionsByMonth } from '../utils/groupTransactionsByMonth';
import { formatMonthHeader } from '../utils/formatMonthHeader';
import { TransactionItem } from './TransactionItem';
import { LoadingState } from '../../../components/LoadingState';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { ERROR_MESSAGES } from '../constants/errorMessages';

export function TransactionList() {
  const { data: transactions, loading, error, refetch } = useRewardsTransactions();

  // Memoize grouping computation per FR-052
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByMonth(transactions);
  }, [transactions]);

  // Loading state
  if (loading) {
    return <LoadingState type="transactions" />;
  }

  // Error state
  if (error) {
    return (
      <div className="transaction-list">
        <ErrorState
          message={ERROR_MESSAGES.TRANSACTIONS_LOAD_FAILED}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="transaction-list">
        <EmptyState message="Aún no tienes actividad" />
      </div>
    );
  }

  // Data loaded with grouped transactions
  return (
    <div className="transaction-list">
      <h2 className="transaction-list-title">Historial</h2>
      {groupedTransactions.map((group) => (
        <div key={`${group.year}-${group.month}`} className="transaction-group">
          <h3 className="transaction-group-header">
            {formatMonthHeader(group.month, group.year)}
          </h3>
          <div className="transaction-group-items">
            {group.transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      ))}
      {/* LoadMoreButton will be added in Phase 5 (US3) */}
    </div>
  );
}
