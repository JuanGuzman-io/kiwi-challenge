/**
 * Component tests for WithdrawWarningCard
 * Per task T040
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WithdrawWarningCard } from '../../../../src/features/rewards/components/withdraw/WithdrawWarningCard';

describe('WithdrawWarningCard', () => {
  it('should render warning message and icon with role note', () => {
    render(<WithdrawWarningCard />);

    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(screen.getByAltText('Advertencia')).toBeInTheDocument();
    expect(
      screen.getByText(/Debes esperar unos minutos/i)
    ).toBeInTheDocument();
  });
});
