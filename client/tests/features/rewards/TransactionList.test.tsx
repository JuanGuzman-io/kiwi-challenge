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

  // T086 & T093: "Load more" button appends transactions without layout jump
  it('should append transactions when "Load more" is clicked without layout jump', async () => {
    const { container } = render(<TransactionList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    // Should show "Load more" button
    const loadMoreButton = screen.getByRole('button', { name: /Cargar más transacciones/i });
    expect(loadMoreButton).toBeInTheDocument();

    // Get initial transaction count
    const initialItems = container.querySelectorAll('.transaction-item');
    const initialCount = initialItems.length;

    // Click "Load more"
    loadMoreButton.click();

    // Wait for more transactions to load
    await waitFor(() => {
      const updatedItems = container.querySelectorAll('.transaction-item');
      expect(updatedItems.length).toBeGreaterThan(initialCount);
    });

    // Button should be hidden after loading all transactions
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Cargar más transacciones/i })).not.toBeInTheDocument();
    });
  });

  // T094: "Load more" button disabled while loadingMore=true
  it('should disable "Load more" button while loading', async () => {
    render(<TransactionList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole('button', { name: /Cargar más transacciones/i });

    // Click button
    loadMoreButton.click();

    // Button should be disabled while loading
    await waitFor(() => {
      expect(loadMoreButton).toBeDisabled();
    });
  });

  // T095: "Load more" button hidden when hasMore=false
  it('should hide "Load more" button when no more transactions', async () => {
    // Override handler to return single page
    server.use(
      http.get('/rewards/transactions', () => {
        return HttpResponse.json({
          transactions: [
            {
              id: 'txn_001',
              type: 'CASHBACK',
              amount: 25.50,
              description: 'Test transaction',
              createdAt: '2025-09-15T14:30:00Z',
            },
          ],
          nextCursor: null,
          hasMore: false,
          count: 1,
        });
      })
    );

    render(<TransactionList />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    // "Load more" button should not be present
    expect(screen.queryByRole('button', { name: /Cargar más/i })).not.toBeInTheDocument();
  });

  // T096: Pagination maintains month grouping across pages
  it('should maintain month grouping when loading more transactions', async () => {
    render(<TransactionList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    // Should have month headers
    expect(screen.getByText(/Septiembre 2025/i)).toBeInTheDocument();

    // Load more
    const loadMoreButton = screen.getByRole('button', { name: /Cargar más transacciones/i });
    loadMoreButton.click();

    // Wait for more transactions
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Cargar más transacciones/i })).not.toBeInTheDocument();
    });

    // Month grouping should still be present
    expect(screen.getByText(/Septiembre 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Agosto 2025/i)).toBeInTheDocument();
  });
});
