/**
 * BalanceSummaryCard component
 * Per FR-002, FR-003, FR-004: Display balance with currency, "Monto acumulado" label, and "Retirar" button
 * Per FR-013, FR-014: Disable button when balance is zero or loading
 * Per FR-025: Display skeleton loader while loading
 * Per FR-033: Display error message with retry action on API failure
 */

import { useRewardsSummary } from '../hooks/useRewardsSummary';
import { formatCurrency } from '../utils/formatCurrency';
import { LoadingState } from '../../../components/LoadingState';
import { ErrorState } from '../../../components/ErrorState';
import { ERROR_MESSAGES } from '../constants/errorMessages';

export function BalanceSummaryCard() {
  const { data: summary, loading, error, refetch } = useRewardsSummary();

  // Loading state
  if (loading) {
    return <LoadingState type="balance" />;
  }

  // Error state
  if (error) {
    return (
      <div className="balance-summary-card">
        <ErrorState
          message={ERROR_MESSAGES.SUMMARY_LOAD_FAILED}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Data loaded
  if (!summary) {
    return null;
  }

  const isButtonDisabled = summary.balance <= 0;

  return (
    <div className="balance-summary-card">
      <div className="balance-content">
        <p className="balance-label">Monto acumulado</p>
        <p className="balance-amount">
          {formatCurrency(summary.balance, summary.currency)}
        </p>
      </div>
      <button
        className="withdraw-button"
        disabled={isButtonDisabled}
        aria-disabled={isButtonDisabled}
        aria-label="Retirar fondos"
      >
        Retirar
      </button>
    </div>
  );
}
