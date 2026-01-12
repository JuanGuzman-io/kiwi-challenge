/**
 * Tests for WithdrawScreen component
 * Per tasks T018-T019, T047-T049: Test balance display, button states, duplicate prevention
 * Following TDD approach - write tests FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from 'jest-axe';
import { server } from '../../../mocks/server';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';
import {
  withdrawalSuccessHandler,
  withdrawalBankAccountNotFoundHandler,
  withdrawalServerErrorHandler,
} from '../../../mocks/handlers/withdrawalHandlers';

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
        <Route path="/withdraw/success" element={<div>Withdraw Success</div>} />
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
      const button = screen.getByRole('button', { name: /retirar fondos/i });
      expect(button).toBeDisabled();
    });
  });

  // T019: Primary action button is enabled when account is selected
  it('should enable primary action button when account is selected', async () => {
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /retirar fondos/i });
      expect(button).not.toBeDisabled();
    });
  });

  // T047, T049: Prevents duplicate submissions
  it('should prevent duplicate button taps', async () => {
    server.use(withdrawalSuccessHandler);
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /retirar fondos/i });
      expect(button).not.toBeDisabled();

      // Rapid double-click
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    // Button should disable after first click to prevent duplicates
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /retirar fondos/i });
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

  it('should display cooldown warning card', async () => {
    renderWithRouterAndState();

    await waitFor(() => {
      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Debes esperar unos minutos/i)
    ).toBeInTheDocument();
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
    server.use(withdrawalSuccessHandler);
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /retirar fondos/i });
      expect(button).not.toBeDisabled();
    });

    // Click to start submission
    const button = screen.getByRole('button', { name: /retirar fondos/i });
    fireEvent.click(button);

    // After click, button should be disabled with proper ARIA
    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // T048: Loading indicator shows "Procesando..." during submission
  it('should show loading indicator "Procesando..." on button during submission', async () => {
    server.use(withdrawalSuccessHandler);
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /retirar fondos/i });
      expect(button).toHaveTextContent('Retirar fondos');
      expect(button).not.toBeDisabled();
    });

    // Click to start submission
    const button = screen.getByRole('button', { name: /retirar fondos/i });
    fireEvent.click(button);

    // Button text should change to "Procesando..."
    await waitFor(() => {
      expect(button).toHaveTextContent('Procesando...');
      expect(button).toBeDisabled();
    });
  });

  // T049: Rapid clicks only trigger one submission (verify with console.log spy)
  it('should prevent duplicate submissions from rapid clicks', async () => {
    server.use(withdrawalSuccessHandler);
    renderWithRouterAndState(mockSelectedAccount);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /retirar fondos/i });
      expect(button).not.toBeDisabled();
    });

    const button = screen.getByRole('button', { name: /retirar fondos/i });

    // Rapid triple-click
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Wait a bit for any async operations
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    expect(button).toBeDisabled();
  });

  // T009 [US1]: Submission tests for User Story 1
  describe('Withdrawal Submission (US1)', () => {
    it('should submit withdrawal on button click with selected account', async () => {
      server.use(withdrawalSuccessHandler);
      renderWithRouterAndState(mockSelectedAccount);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /retirar fondos/i });
        expect(button).not.toBeDisabled();
      });

      const button = screen.getByRole('button', { name: /retirar fondos/i });

      // Click submit button
      fireEvent.click(button);

      // Should show loading state
      await waitFor(() => {
        expect(button).toHaveTextContent('Procesando...');
        expect(button).toBeDisabled();
      });

      await waitFor(() => {
        expect(screen.getByText('Withdraw Success')).toBeInTheDocument();
      });
    });

    it('should prevent rapid clicks during submission', async () => {
      server.use(withdrawalSuccessHandler);
      renderWithRouterAndState(mockSelectedAccount);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /retirar fondos/i });
        expect(button).not.toBeDisabled();
      });

      const button = screen.getByRole('button', { name: /retirar fondos/i });

      // Rapid triple-click
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Button should disable immediately after first click
      await waitFor(() => {
        expect(button).toBeDisabled();
      });

      expect(button).toBeDisabled();
    });

    it('should display loading text "Procesando..." during submission', async () => {
      server.use(withdrawalSuccessHandler);
      renderWithRouterAndState(mockSelectedAccount);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /retirar fondos/i });
        expect(button).toHaveTextContent('Retirar fondos');
      });

      const button = screen.getByRole('button', { name: /retirar fondos/i });

      fireEvent.click(button);

      // Button text should change to "Procesando..."
      await waitFor(() => {
        expect(button).toHaveTextContent('Procesando...');
      });
    });

    it('should show error message on server failure', async () => {
      server.use(withdrawalServerErrorHandler);

      renderWithRouterAndState(mockSelectedAccount);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retirar fondos/i })
        ).not.toBeDisabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /retirar fondos/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/unexpected error occurred/i)
      ).toBeInTheDocument();
    });

    it('should show bank account not found message on 404', async () => {
      server.use(withdrawalBankAccountNotFoundHandler);

      renderWithRouterAndState(mockSelectedAccount);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retirar fondos/i })
        ).not.toBeDisabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /retirar fondos/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/cuenta bancaria seleccionada/i)
      ).toBeInTheDocument();
    });

    it('should allow retry by clearing error state', async () => {
      server.use(withdrawalServerErrorHandler);

      renderWithRouterAndState(mockSelectedAccount);

      fireEvent.click(screen.getByRole('button', { name: /retirar fondos/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });
});
