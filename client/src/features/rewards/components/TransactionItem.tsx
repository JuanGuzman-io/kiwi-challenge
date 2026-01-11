/**
 * TransactionItem component
 * Per FR-005: Display transaction title/type, date, and signed amount
 * Per FR-008: Display signed amounts with +/- prefix
 * Per FR-009: Visual distinction between incoming (+) and outgoing (-) amounts
 */

import type { Transaction } from "../types/rewards.types";
import { TRANSACTION_LABELS } from "../constants/transactionLabels";
import { formatDate } from "../utils/formatDate";
import { formatSignedAmount, getAmountType } from "../utils/formatSignedAmount";

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const amountType = getAmountType(transaction.amount);
  const typeLabel = TRANSACTION_LABELS[transaction.type];
  const icon = getTransactionIcon(transaction.type);

  return (
    <div className={`transaction-item transaction-item--${amountType}`}>
      <div className="transaction-icon">{icon}</div>
      <div className="transaction-info">
        <p className="transaction-type">{typeLabel}</p>
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

function getTransactionIcon(type: Transaction["type"]) {
  switch (type) {
    case "WITHDRAWAL":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="icon icon-send">
          <path
            d="M20 4L11 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 4L13 20l-2-7-7-2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "CASHBACK":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="icon icon-store">
          <path
            d="M4 10V6l2-2h12l2 2v4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M5 10h14v8H5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9 14h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "REFERRAL_BONUS":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="icon icon-user-plus"
        >
          <path
            d="M15 8a3 3 0 11-6 0 3 3 0 016 0z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 20a6 6 0 0116 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M19 8v4M17 10h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "INCOME":
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="icon icon-income"
        >
          <path
            d="M5 12l7-7 7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 5v14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
