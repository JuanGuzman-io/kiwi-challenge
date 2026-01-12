/**
 * Tests for WithdrawScreen component
 * Per tasks T018-T019, T047-T049: Test balance display, button states, duplicate prevention
 * Following TDD approach - write tests FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from 'jest-axe';
import { server } from '../../../mocks/server';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';

// Mock component import - will be implemented after tests
import { WithdrawScreen } from '../../../../src/features/rewards/components/withdraw/WithdrawScreen';

// Helper to render with Router and location state
function renderWithRouterAndState(selectedAccount: BankAccount | null = null) {
  const initialEntries = selectedAccount
    ? [{ pathname: '/withdraw', state: { selectedAccount } }]
    : ['/withdraw'];

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/withdraw" element={<WithdrawScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WithdrawScreen', () => {
  const mockSelectedAccount: BankAccount = {
    id: 'bank-account-001',
    lastFourDigits: '1234',
    accountType: 'Checking',
    isActive: true,
    createdAt: '2026-01-11T17:49:07.082Z',
  };

  beforeEach(() => {
    server.resetHandlers();
  });

  // T018: Displays balance from rewards summary
  it('should display withdrawal amount from rewards balance', async () => {
    renderWithRouterAndState();

    // Wait for balance to load (mock returns $1,234.56)
    await waitFor(() => {
      expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument();
    });
  });

  // T018: Shows page title
  it('should display page title "Elige tu método de retiro"', async () => {
    renderWithRouterAndState();

    await waitFor(() => {
      expect(screen.getByText('Elige tu método de retiro')).toBeInTheDocument();
    });
  });

  // T019: Primary action button is disabled when no account selected
  it('should disable primary action button when no account is selected', async () => {
    renderWithRouterAndState();

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /continuar/i });
      expect(button).toBeDisabled();
    });
  });

  // T019: Primary action button is enabled when account is selected
  it('should enable primary action button when account is selected', async () => {
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /continuar/i });
      expect(button).not.toBeDisabled();
    });
  });

  // T047, T049: Prevents duplicate submissions
  it('should prevent duplicate button taps', async () => {
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /continuar/i });
      expect(button).not.toBeDisabled();

      // Rapid double-click
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    // Should only trigger once (US3 - out of scope for now, but button should disable)
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /continuar/i });
      // Button should be disabled after first click to prevent duplicates
      expect(button).toBeDisabled();
    });
  });

  // Shows account selector
  it('should display account selector', async () => {
    renderWithRouterAndState();

    await waitFor(() => {
      expect(screen.getByText('Selecciona una cuenta')).toBeInTheDocument();
    });
  });

  // Shows selected account in selector
  it('should display selected account in selector', async () => {
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      expect(screen.getByText(/•••• 1234/)).toBeInTheDocument();
    });
  });

  // Displays "Monto total a retirar" label
  it('should display amount label', async () => {
    renderWithRouterAndState();

    await waitFor(() => {
      expect(screen.getByText('Monto total a retirar')).toBeInTheDocument();
    });
  });

  // Accessibility test with jest-axe
  it('should have no accessibility violations', async () => {
    const { container } = renderWithRouterAndState();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // T047: Button disabled during submission with proper aria attributes
  it('should disable button with aria-disabled during submission', async () => {
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /continuar/i });
      expect(button).not.toBeDisabled();
    });

    // Click to start submission
    const button = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(button);

    // After click, button should be disabled with proper ARIA
    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // T048: Loading indicator shows "Procesando..." during submission
  it('should show loading indicator "Procesando..." on button during submission', async () => {
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /continuar/i });
      expect(button).toHaveTextContent('Continuar');
      expect(button).not.toBeDisabled();
    });

    // Click to start submission
    const button = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(button);

    // Button text should change to "Procesando..."
    await waitFor(() => {
      expect(button).toHaveTextContent('Procesando...');
      expect(button).toBeDisabled();
    });
  });

  // T049: Rapid clicks only trigger one submission (verify with console.log spy)
  it('should prevent duplicate submissions from rapid clicks', async () => {
    // Spy on console.log to verify only one submission
    const consoleLogSpy = vi.spyOn(console, 'log');

    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /continuar/i });
      expect(button).not.toBeDisabled();
    });

    const button = screen.getByRole('button', { name: /continuar/i });

    // Rapid triple-click
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Wait a bit for any async operations
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Verify console.log was called exactly once (from handleSubmit)
    const withdrawCalls = consoleLogSpy.mock.calls.filter(
      (call) => call[0] === 'Withdrawing to account:' && call[1] === mockSelectedAccount
    );
    expect(withdrawCalls).toHaveLength(1);

    // Cleanup spy
    consoleLogSpy.mockRestore();
  });
});
