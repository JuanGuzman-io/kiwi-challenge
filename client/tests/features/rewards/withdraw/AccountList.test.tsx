/**
 * Tests for AccountList component
 * Per tasks T022, T037: Test account rendering, empty state, error handling
 * Following TDD approach - write tests FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe } from 'jest-axe';
import { server } from '../../../mocks/server';
import {
  bankAccountsEmptyHandler,
  bankAccountsErrorHandler,
} from '../../../mocks/bankAccountsHandlers';

// Mock component import - will be implemented after tests
import { AccountList } from '../../../../src/features/rewards/components/withdraw/AccountList';

// Mock useNavigate
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

describe('AccountList', () => {
  beforeEach(() => {
    server.resetHandlers();
    mockNavigate.mockClear();
  });

  // T022: Renders list of accounts
  it('should render list of bank accounts', async () => {
    renderWithRouter(<AccountList />);

    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText(/•••• 4321/)).toBeInTheDocument();
    });

    expect(screen.getByText(/•••• 7890/)).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
    expect(screen.getByText('Checking')).toBeInTheDocument();
  });

  // T022: Shows loading state while fetching
  it('should show loading state while fetching accounts', () => {
    renderWithRouter(<AccountList />);

    expect(screen.getByRole('status', { name: /cargando cuentas/i })).toBeInTheDocument();
  });

  // T037: Shows empty state when no accounts
  it('should show empty state when user has no accounts', async () => {
    server.use(bankAccountsEmptyHandler);

    renderWithRouter(<AccountList />);

    await waitFor(() => {
      expect(screen.getByText(/No tienes cuentas bancarias vinculadas/i)).toBeInTheDocument();
    });
  });

  // T022: Shows error state on fetch failure
  it('should show error message when fetch fails', async () => {
    server.use(bankAccountsErrorHandler);

    renderWithRouter(<AccountList />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/No pudimos cargar tus cuentas bancarias/i)).toBeInTheDocument();
  });

  // T022: Selecting an account navigates back to /withdraw
  it('should navigate back to /withdraw with selected account when account is clicked', async () => {
    renderWithRouter(<AccountList />);

    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText(/•••• 4321/)).toBeInTheDocument();
    });

    // Click first account
    const accountButtons = screen.getAllByRole('button');
    fireEvent.click(accountButtons[0]);

    // Should navigate to /withdraw with account in state
    expect(mockNavigate).toHaveBeenCalledWith('/withdraw', {
      state: expect.objectContaining({
        selectedAccount: expect.objectContaining({
          lastFourDigits: '4321',
        }),
      }),
    });
  });

  // Shows retry button in error state
  it('should allow retry after error', async () => {
    server.use(bankAccountsErrorHandler);

    renderWithRouter(<AccountList />);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Reset handler to success
    server.resetHandlers();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
    fireEvent.click(retryButton);

    // Should retry and show accounts
    await waitFor(() => {
      expect(screen.getByText(/•••• 4321/)).toBeInTheDocument();
    });
  });

  // Has proper page title
  it('should display page title', async () => {
    renderWithRouter(<AccountList />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/cuentas bancarias/i);
    });
  });

  // Accessibility test with jest-axe
  it('should have no accessibility violations', async () => {
    const { container } = renderWithRouter(<AccountList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/•••• 4321/)).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Multiple accounts are all selectable
  it('should make all accounts clickable', async () => {
    renderWithRouter(<AccountList />);

    await waitFor(() => {
      expect(screen.getByText(/•••• 4321/)).toBeInTheDocument();
    });

    const accountButtons = screen.getAllByRole('button');
    expect(accountButtons.length).toBeGreaterThanOrEqual(2);

    // Each button should be clickable
    accountButtons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });
});
