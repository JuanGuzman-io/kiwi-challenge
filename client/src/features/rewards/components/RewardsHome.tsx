/**
 * RewardsHome page component
 * Main entry point for rewards feature
 * Composes RewardsHeader, BalanceSummaryCard (US1), and TransactionList (US2)
 */

import { RewardsHeader } from './RewardsHeader';
import { BalanceSummaryCard } from './BalanceSummaryCard';
import { TransactionList } from './TransactionList';

export function RewardsHome() {
  return (
    <div className="rewards-home">
      <RewardsHeader />
      <BalanceSummaryCard />
      <TransactionList />
    </div>
  );
}
