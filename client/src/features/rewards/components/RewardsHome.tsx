/**
 * RewardsHome page component
 * Main entry point for rewards feature
 * Composes RewardsHeader, BalanceSummaryCard (US1), and TransactionList (US2)
 */

import { useEffect } from 'react';
import { RewardsHeader } from './RewardsHeader';
import { BalanceSummaryCard } from './BalanceSummaryCard';
import { TransactionList } from './TransactionList';
import { PerformanceMarker } from '../utils/logger';

export function RewardsHome() {
  // T127: Track page load time
  useEffect(() => {
    const marker = new PerformanceMarker('RewardsHome');

    return () => {
      marker.end();
    };
  }, []);

  return (
    <div className="rewards-home">
      <RewardsHeader />
      <BalanceSummaryCard />
      <TransactionList />
    </div>
  );
}
