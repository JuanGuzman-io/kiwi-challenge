/**
 * Tests for WithdrawSuccessScreen component
 * Per tasks T019: Success screen behavior and accessibility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from 'jest-axe';
import type { WithdrawSuccessLocationState } from '../../../../src/features/rewards/types/withdrawal.types';
import { WithdrawSuccessScreen } from '../../../../src/features/rewards/components/withdraw/WithdrawSuccessScreen';

function renderWithState(state?: WithdrawSuccessLocationState) {
  const initialEntries = state
    ? [{ pathname: '/withdraw/success', state }]
    : ['/withdraw/success'];

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/withdraw" element={<div>Withdraw</div>} />
        <Route path="/rewards" element={<div>Rewards</div>} />
        <Route path="/withdraw/success" element={<WithdrawSuccessScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WithdrawSuccessScreen', () => {
  const successState: WithdrawSuccessLocationState = {
    withdrawalData: {
      id: 'withdrawal-001',
      bankAccountId: 'bank-account-001',
      amount: 101.25,
      currency: 'USD',
      status: 'completed',
      createdAt: new Date().toISOString(),
      lastFourDigits: '1234',
    },
  };

  beforeEach(() => {
    // no-op placeholder to keep structure consistent
  });

  it('should display success title and description with account digits', async () => {
    renderWithState(successState);

    expect(
      screen.getByRole('heading', { name: /tu retiro fue exitoso/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/terminada en 1234/i)
    ).toBeInTheDocument();
  });

  it('should display cooldown warning card', async () => {
    renderWithState(successState);

    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(
      screen.getByText(/Debes esperar unos minutos/i)
    ).toBeInTheDocument();
  });

  it('should render success image and fallback when image fails', async () => {
    renderWithState(successState);

    const img = screen.getByAltText(/retiro exitoso/i);
    expect(img).toBeInTheDocument();

    fireEvent.error(img);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should redirect to /withdraw when no navigation state is present', async () => {
    const { container } = renderWithState();

    expect(
      container.querySelector('.withdraw-success-screen--skeleton')
    ).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Withdraw')).toBeInTheDocument();
    });
  });

  it('should navigate to /rewards on "Regresar a Rewards" click', async () => {
    renderWithState(successState);

    fireEvent.click(screen.getByRole('button', { name: /regresar a rewards/i }));

    await waitFor(() => {
      expect(screen.getByText('Rewards')).toBeInTheDocument();
    });
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderWithState(successState);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
