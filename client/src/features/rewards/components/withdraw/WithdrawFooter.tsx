/**
 * WithdrawFooter component
 * Wraps primary action with persistent warning card
 */

import type { ReactNode } from 'react';
import { WithdrawWarningCard } from './WithdrawWarningCard';

interface WithdrawFooterProps {
  children: ReactNode;
}

export function WithdrawFooter({ children }: WithdrawFooterProps) {
  return (
    <div className="withdraw-footer">
      <WithdrawWarningCard />
      {children}
    </div>
  );
}
