/**
 * Integration tests for TransactionList component
 * Per tasks T073-T081: Test component with MSW mocks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { TransactionList } from '../../../src/features/rewards/components/TransactionList';

describe('TransactionList', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  // T074: Transactions grouped by month with Spanish headers
  it('should group transactions by month with Spanish headers', async () => {
    render(<TransactionList />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    // Check for month headers (mock data has transactions from Sep, Aug, Jul 2025)
    expect(screen.getByText(/Septiembre 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Agosto 2025/i)).toBeInTheDocument();
  });

  // T075: Transactions display in newest-first order
  it('should display transactions in newest-first order', async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    // Get all transaction descriptions in order
    const descriptions = screen.getAllByText(/Cashback|Withdrawal|Referral|Bonus/i);

    // First transaction should be from September (newest)
    expect(descriptions[0]).toHaveTextContent(/Cashback on purchase/);
  });

  // T076: Incoming transactions show + prefix and positive styling
  it('should show + prefix for incoming transactions with positive styling', async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    // Check for positive amounts with + prefix
    const positiveAmount = screen.getByText(/\+\$25\.50/);
    expect(positiveAmount).toBeInTheDocument();
    expect(positiveAmount.className).toContain('incoming');
  });

  // T077: Outgoing transactions show - prefix and negative styling
  it('should show - prefix for outgoing transactions with negative styling', async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    // Check for negative amounts with - prefix
    const negativeAmount = screen.getByText(/-\$10\.00/);
    expect(negativeAmount).toBeInTheDocument();
    expect(negativeAmount.className).toContain('outgoing');
  });

  // T078: Empty state displays "Aún no tienes actividad" message
  it('should display empty state message when no transactions', async () => {
    // Override handler to return empty array
    server.use(
      http.get('/rewards/transactions', () => {
        return HttpResponse.json({
          transactions: [],
          nextCursor: null,
          hasMore: false,
          count: 0,
        });
      })
    );

    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByText(/Aún no tienes actividad/i)).toBeInTheDocument();
    });
  });

  // T079: Loading state shows skeleton placeholders
  it('should show skeleton placeholders while loading', () => {
    render(<TransactionList />);

    // Loading state should be present initially
    expect(screen.getByRole('status', { name: /cargando transacciones/i })).toBeInTheDocument();
  });

  // T080: Error state shows Spanish error message and retry
  it('should show Spanish error message and retry button on error', async () => {
    // Override handler to return error
    server.use(
      http.get('/rewards/transactions', () => {
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

    render(<TransactionList />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Check error message in Spanish
    expect(screen.getByText(/No pudimos cargar tus transacciones/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();
  });

  // T081: jest-axe finds no violations in TransactionList
  it('should have no accessibility violations', async () => {
    const { container } = render(<TransactionList />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    // Run accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
