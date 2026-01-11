/**
 * Integration tests for BalanceSummaryCard component
 * Per tasks T048-T053: Test component with MSW mocks
 * Per tasks T097-T100: Test withdrawal navigation functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe } from 'jest-axe';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { BalanceSummaryCard } from '../../../src/features/rewards/components/BalanceSummaryCard';

// Helper to render with Router
function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('BalanceSummaryCard', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  // T049: Balance displays with correct currency formatting
  it('should display balance with correct currency formatting', async () => {
    renderWithRouter(<BalanceSummaryCard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Monto acumulado')).toBeInTheDocument();
    });

    // Check formatted balance (default mock: 1234.56 USD)
    expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument();
  });

  // T050: Loading state shows skeleton placeholder
  it('should show skeleton placeholder while loading', () => {
    renderWithRouter(<BalanceSummaryCard />);

    // Loading state should be present initially
    expect(screen.getByRole('status', { name: /cargando balance/i })).toBeInTheDocument();
  });

  // T051: Error state shows Spanish error message and retry button
  it('should show Spanish error message and retry button on error', async () => {
    // Override handler to return error
    server.use(
      http.get('/rewards/summary', () => {
        return HttpResponse.json(
          {
            type: 'https://api.example.com/problems/internal-error',
            title: 'Internal Server Error',
            status: 500,
          },
          { status: 500 }
        );
      })
    );

    renderWithRouter(<BalanceSummaryCard />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Check error message in Spanish
    expect(screen.getByText(/No pudimos cargar tu balance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();
  });

  // T052: Zero balance displays "0.00"
  it('should display zero balance as "0.00"', async () => {
    // Override handler to return zero balance
    server.use(
      http.get('/rewards/summary', () => {
        return HttpResponse.json({
          balance: 0,
          currency: 'USD',
        });
      })
    );

    renderWithRouter(<BalanceSummaryCard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Monto acumulado')).toBeInTheDocument();
    });

    // Check zero balance
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();

    // Button should be disabled
    const button = screen.getByRole('button', { name: /Retirar fondos/i });
    expect(button).toBeDisabled();
  });

  // T053: jest-axe finds no violations in BalanceSummaryCard
  it('should have no accessibility violations', async () => {
    const { container } = renderWithRouter(<BalanceSummaryCard />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Monto acumulado')).toBeInTheDocument();
    });

    // Run accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // T097: "Retirar" button navigates to /withdraw when clicked
  it('should navigate to /withdraw when "Retirar" button is clicked', async () => {
    renderWithRouter(<BalanceSummaryCard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Monto acumulado')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /Retirar fondos/i });
    expect(button).not.toBeDisabled();

    // Click the button
    button.click();

    // Check that we navigated to /withdraw
    await waitFor(() => {
      expect(window.location.pathname).toBe('/withdraw');
    });
  });

  // T098: "Retirar" button disabled when balance is zero
  it('should disable "Retirar" button when balance is zero', async () => {
    server.use(
      http.get('/rewards/summary', () => {
        return HttpResponse.json({
          balance: 0,
          currency: 'USD',
        });
      })
    );

    renderWithRouter(<BalanceSummaryCard />);

    await waitFor(() => {
      expect(screen.getByText('Monto acumulado')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /Retirar fondos/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  // T099: "Retirar" button disabled while loading=true
  it('should disable "Retirar" button while loading', () => {
    renderWithRouter(<BalanceSummaryCard />);

    // Initially loading
    const loadingElement = screen.getByRole('status', { name: /cargando balance/i });
    expect(loadingElement).toBeInTheDocument();

    // Button should not be present while loading (skeleton state)
    expect(screen.queryByRole('button', { name: /Retirar fondos/i })).not.toBeInTheDocument();
  });

  // T100: Double-tap on "Retirar" only triggers one navigation
  it('should prevent double-tap on "Retirar" button', async () => {
    const mockNavigate = vi.fn();

    // Mock the navigate function
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    renderWithRouter(<BalanceSummaryCard />);

    await waitFor(() => {
      expect(screen.getByText('Monto acumulado')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /Retirar fondos/i });

    // Click twice rapidly
    button.click();
    button.click();

    // Wait a bit
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Should only navigate once (or button should be disabled after first click)
    expect(button).toBeDisabled();
  });
});
