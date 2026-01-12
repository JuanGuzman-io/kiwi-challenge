/**
 * Component tests for WithdrawSuccessScreen
 * Per task T019
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WithdrawSuccessScreen } from '../../../../src/features/rewards/components/withdraw/WithdrawSuccessScreen';
import type { WithdrawSuccessLocationState } from '../../../../src/features/rewards/types/withdrawal.types';

expect.extend(toHaveNoViolations);

const withdrawalState: WithdrawSuccessLocationState = {
  withdrawalData: {
    id: 'withdrawal-001',
    bankAccountId: 'bank-account-001',
    amount: 1234.56,
    currency: 'USD',
    status: 'pending',
    createdAt: '2026-01-11T17:49:07.082Z',
    lastFourDigits: '1234',
  },
};

function renderSuccess(state?: WithdrawSuccessLocationState | null) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/withdraw/success', state }]}>
      <Routes>
        <Route path="/withdraw/success" element={<WithdrawSuccessScreen />} />
        <Route path="/withdraw" element={<div>Withdraw Screen</div>} />
        <Route path="/rewards" element={<div>Rewards Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WithdrawSuccessScreen', () => {
  it('should render title, description, and account digits', () => {
    renderSuccess(withdrawalState);

    expect(screen.getByText('¡Tu retiro fue exitoso!')).toBeInTheDocument();
    expect(
      screen.getByText(/terminada en 1234/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Regresar a Rewards/i })
    ).toBeInTheDocument();
  });

  it('should navigate back to /rewards when button is clicked', () => {
    renderSuccess(withdrawalState);

    fireEvent.click(screen.getByRole('button', { name: /Regresar a Rewards/i }));

    expect(screen.getByText('Rewards Screen')).toBeInTheDocument();
  });

  it('should redirect to /withdraw when no state is provided', async () => {
    renderSuccess(null);

    await waitFor(() => {
      expect(screen.getByText('Withdraw Screen')).toBeInTheDocument();
    });
  });

  it('should show fallback when success image fails to load', () => {
    renderSuccess(withdrawalState);

    const image = screen.getByAltText('Retiro exitoso');
    fireEvent.error(image);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderSuccess(withdrawalState);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
