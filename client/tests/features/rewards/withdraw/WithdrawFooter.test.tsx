/**
 * Component tests for WithdrawFooter
 * Per task T020
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WithdrawFooter } from '../../../../src/features/rewards/components/withdraw/WithdrawFooter';

describe('WithdrawFooter', () => {
  it('should render children and warning card', () => {
    render(
      <WithdrawFooter>
        <button type="button">Accion primaria</button>
      </WithdrawFooter>
    );

    expect(screen.getByText('Accion primaria')).toBeInTheDocument();
    expect(screen.getByRole('note')).toBeInTheDocument();
  });
});
