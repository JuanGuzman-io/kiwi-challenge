/**
 * Component tests for AccountSelector
 * Per tasks T020-T021, T035-T036, T038
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountSelector } from '../../../../src/features/rewards/components/withdraw/AccountSelector';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AccountSelector', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should show placeholder when no account selected', () => {
    render(<AccountSelector selectedAccount={null} />);

    expect(screen.getByText('Seleccionar')).toBeInTheDocument();
  });

  it('should navigate to /withdraw/accounts when clicked', () => {
    render(<AccountSelector selectedAccount={null} />);

    const button = screen.getByRole('button', {
      name: /Selecciona una cuenta bancaria/i,
    });

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/withdraw/accounts');
  });

  it('should show loading state while fetching accounts', () => {
    render(<AccountSelector selectedAccount={null} loading />);

    expect(
      screen.getByRole('status', { name: /Cargando cuentas/i })
    ).toBeInTheDocument();
  });

  it('should show error state and retry button when error occurs', () => {
    const onRetry = vi.fn();

    render(
      <AccountSelector
        selectedAccount={null}
        error={new Error('API failure')}
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole('button', {
      name: /Intentar de nuevo/i,
    });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should show selected account details when available', () => {
    const selectedAccount: BankAccount = {
      id: 'bank-account-001',
      lastFourDigits: '1234',
      accountType: 'Checking',
      isActive: true,
      createdAt: '2026-01-11T17:49:07.082Z',
    };

    render(<AccountSelector selectedAccount={selectedAccount} />);

    expect(screen.getByText(/1234/)).toBeInTheDocument();
  });
});
