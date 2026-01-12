/**
 * Comprehensive accessibility tests for withdraw feature
 * Per task T039: Test screen reader announcements with jest-axe
 * Per tasks T044-T045: Verify aria-live regions for loading and error states
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { server } from '../../../mocks/server';
import {
  bankAccountsErrorHandler,
  bankAccountsEmptyHandler,
} from '../../../mocks/bankAccountsHandlers';

import { WithdrawScreen } from '../../../../src/features/rewards/components/withdraw/WithdrawScreen';
import { AccountList } from '../../../../src/features/rewards/components/withdraw/AccountList';
import { AccountSelector } from '../../../../src/features/rewards/components/withdraw/AccountSelector';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Helper to render with Router
function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('Withdraw Feature Accessibility', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('T044: Loading State Accessibility', () => {
    // T044: AccountSelector loading state has role="status" and aria-label
    it('should announce loading state to screen readers in AccountSelector', () => {
      renderWithRouter(<AccountSelector selectedAccount={null} loading={true} />);

      // Per FR-023: Loading states use role="status" and aria-live="polite"
      const loadingState = screen.getByRole('status', { name: /cargando cuentas/i });
      expect(loadingState).toBeInTheDocument();
      expect(loadingState).toHaveAttribute('aria-label', 'Cargando cuentas');
    });

    // T044: AccountList loading state announces to screen readers
    it('should announce loading state to screen readers in AccountList', () => {
      renderWithRouter(<AccountList />);

      // Should have loading announcement
      const loadingState = screen.getByRole('status');
      expect(loadingState).toBeInTheDocument();
      expect(loadingState).toHaveAttribute('aria-label');
    });

    // T044: WithdrawScreen loading state is accessible
    it('should announce balance loading to screen readers in WithdrawScreen', () => {
      renderWithRouter(<WithdrawScreen />);

      // Should have loading state with proper role
      const loadingState = screen.getByRole('status', { name: /cargando balance/i });
      expect(loadingState).toBeInTheDocument();
    });
  });

  describe('T045: Error State Accessibility', () => {
    // T045: Error states use role="alert" and aria-live="assertive"
    it('should announce errors assertively to screen readers in AccountSelector', async () => {
      server.use(bankAccountsErrorHandler);

      renderWithRouter(
        <AccountSelector
          selectedAccount={null}
          error={new Error('Failed')}
          onRetry={() => {}}
        />
      );

      await waitFor(() => {
        // Per FR-027: Errors use role="alert" and aria-live="assertive"
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
      });
    });

    // T045: AccountList error state is properly announced
    it('should announce errors assertively to screen readers in AccountList', async () => {
      server.use(bankAccountsErrorHandler);

      renderWithRouter(<AccountList />);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
      });
    });

    // T045: Error messages are in Spanish and user-friendly
    it('should display user-friendly Spanish error messages', async () => {
      server.use(bankAccountsErrorHandler);

      renderWithRouter(<AccountList />);

      await waitFor(() => {
        expect(
          screen.getByText(/No pudimos cargar tus cuentas bancarias/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('T039: Comprehensive Accessibility Validation', () => {
    // T039: WithdrawScreen has no accessibility violations
    it('should have no accessibility violations in WithdrawScreen', async () => {
      const { container } = renderWithRouter(<WithdrawScreen />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    // T039: AccountList has no accessibility violations
    it('should have no accessibility violations in AccountList', async () => {
      const { container } = renderWithRouter(<AccountList />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText(/•••• 4321/)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    // T039: AccountList with empty state is accessible
    it('should have no accessibility violations in empty state', async () => {
      server.use(bankAccountsEmptyHandler);

      const { container } = renderWithRouter(<AccountList />);

      await waitFor(() => {
        expect(
          screen.getByText(/No tienes cuentas bancarias vinculadas/i)
        ).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    // T039: Error states are accessible
    it('should have no accessibility violations in error state', async () => {
      server.use(bankAccountsErrorHandler);

      const { container } = renderWithRouter(<AccountList />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    // T039: Retry button is keyboard accessible
    it('should make retry button keyboard accessible', async () => {
      server.use(bankAccountsErrorHandler);

      renderWithRouter(<AccountList />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toHaveAccessibleName();
      });
    });

    // T039: Focus management is accessible
    it('should manage focus appropriately for keyboard users', async () => {
      renderWithRouter(<AccountList />);

      await waitFor(() => {
        // Page title should be present for screen reader navigation
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveAccessibleName();
      });
    });

    // T039: All interactive elements are keyboard accessible
    it('should make all interactive elements keyboard accessible', async () => {
      renderWithRouter(<AccountList />);

      await waitFor(() => {
        expect(screen.getByText(/•••• 4321/)).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // All buttons should have accessible names
        expect(button).toHaveAccessibleName();
        // All buttons should be keyboard focusable (not have tabindex="-1")
        const tabIndex = button.getAttribute('tabindex');
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Screen Reader Context', () => {
    // Proper semantic HTML structure
    it('should use semantic HTML for better screen reader navigation', async () => {
      renderWithRouter(<AccountList />);

      await waitFor(() => {
        // Should have proper heading hierarchy
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();

        // List should have proper list role
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();

        // List items should be present
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });

    // Text alternatives for visual information
    it('should provide text alternatives for masked account numbers', async () => {
      renderWithRouter(<AccountList />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          const label = button.getAttribute('aria-label');
          if (label && label.includes('terminada en')) {
            // Aria label should describe the account fully
            expect(label).toMatch(/Cuenta \w+ terminada en \d{4}/);
          }
        });
      });
    });
  });
});
