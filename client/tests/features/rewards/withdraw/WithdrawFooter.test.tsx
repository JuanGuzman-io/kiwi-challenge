/**
 * Tests for WithdrawFooter component
 * Per tasks T020: Renders children and warning card
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WithdrawFooter } from '../../../../src/features/rewards/components/withdraw/WithdrawFooter';

describe('WithdrawFooter', () => {
  it('should render warning card and children', () => {
    render(
      <WithdrawFooter>
        <button type="button">Primary action</button>
      </WithdrawFooter>
    );

    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(
      screen.getByText(/Debes esperar unos minutos/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Primary action')).toBeInTheDocument();
  });
});
