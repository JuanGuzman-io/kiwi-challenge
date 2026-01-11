/**
 * TransactionItem component
 * Per FR-005: Display transaction title/type, date, and signed amount
 * Per FR-008: Display signed amounts with +/- prefix
 * Per FR-009: Visual distinction between incoming (+) and outgoing (-) amounts
 */

import type { Transaction } from '../types/rewards.types';
import { TRANSACTION_LABELS } from '../constants/transactionLabels';
import { formatDate } from '../utils/formatDate';
import { formatSignedAmount, getAmountType } from '../utils/formatSignedAmount';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const amountType = getAmountType(transaction.amount);
  const typeLabel = TRANSACTION_LABELS[transaction.type];

  return (
    <div className={`transaction-item transaction-item--${amountType}`}>
      <div className="transaction-info">
        <p className="transaction-type">{typeLabel}</p>
        <p className="transaction-description">{transaction.description}</p>
        <p className="transaction-date">{formatDate(transaction.createdAt)}</p>
      </div>
      <div className="transaction-amount">
        <p className={`amount amount--${amountType}`}>
          {formatSignedAmount(transaction.amount)}
        </p>
      </div>
    </div>
  );
}
