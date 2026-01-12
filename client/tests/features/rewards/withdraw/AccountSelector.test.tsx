/**
 * Tests for AccountSelector component
 * Per tasks T020-T021, T035-T036, T038: Test placeholder, navigation, loading/error states
 * Following TDD approach - write tests FIRST
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe } from 'jest-axe';
import { server } from '../../../mocks/server';
import { bankAccountsErrorHandler } from '../../../mocks/bankAccountsHandlers';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';

// Mock component import - will be implemented after tests
import { AccountSelector } from '../../../../src/features/rewards/components/withdraw/AccountSelector';

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render with Router
function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('AccountSelector', () => {
  const mockSelectedAccount: BankAccount = {
    id: 'bank-account-001',
    lastFourDigits: '1234',
    accountType: 'Checking',
    isActive: true,
    createdAt: '2026-01-11T17:49:07.082Z',
  };

  beforeEach(() => {
    server.resetHandlers();
    mockNavigate.mockClear();
  });

  // T020: Shows placeholder when no account selected
  it('should display placeholder text when no account is selected', async () => {
    renderWithRouter(<AccountSelector selectedAccount={null} />);

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Selecciona una cuenta')).toBeInTheDocument();
    });
  });

  // T020: Shows selected account when account is provided
  it('should display selected account in masked format', async () => {
    renderWithRouter(<AccountSelector selectedAccount={mockSelectedAccount} />);

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText(/•••• 1234/)).toBeInTheDocument();
    });
  });

  // T021: Navigates to /withdraw/accounts when clicked
  it('should navigate to /withdraw/accounts when clicked', async () => {
    renderWithRouter(<AccountSelector selectedAccount={null} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/withdraw/accounts');
  });

  // T035: Shows loading state while fetching accounts
  it('should show loading state while accounts are being fetched', () => {
    renderWithRouter(<AccountSelector selectedAccount={null} loading={true} />);

    expect(screen.getByRole('status', { name: /cargando cuentas/i })).toBeInTheDocument();
  });

  // T036: Shows error state when account fetch fails
  it('should show error message when accounts fail to load', async () => {
    server.use(bankAccountsErrorHandler);

    renderWithRouter(
      <AccountSelector selectedAccount={null} error={new Error('Failed to load')} />
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/No pudimos cargar tus cuentas bancarias/i)).toBeInTheDocument();
  });

  // T038: Shows retry button in error state
  it('should show retry button when error occurs', async () => {
    const mockRetry = vi.fn();

    renderWithRouter(
      <AccountSelector
        selectedAccount={null}
        error={new Error('Failed to load')}
        onRetry={mockRetry}
      />
    );

    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  // Has proper ARIA label
  it('should have accessible label for account selector', async () => {
    renderWithRouter(<AccountSelector selectedAccount={null} />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName(/selecciona una cuenta bancaria/i);
    });
  });

  // Accessibility test with jest-axe
  it('should have no accessibility violations', async () => {
    const { container } = renderWithRouter(<AccountSelector selectedAccount={null} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Disabled state during loading
  it('should disable button while loading', () => {
    renderWithRouter(<AccountSelector selectedAccount={null} loading={true} />);

    const button = screen.queryByRole('button', { name: /selecciona una cuenta bancaria/i });
    // Button should not be present or should be disabled during loading
    if (button) {
      expect(button).toBeDisabled();
    }
  });
});
