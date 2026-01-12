/**
 * Integration tests for TransactionList component
 * Per tasks T073-T081, T093-T096: Test component with MSW mocks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../../mocks/server';
import { TransactionList } from '../../../src/features/rewards/components/TransactionList';

expect.extend(toHaveNoViolations);

const mockTransactions = [
  {
    id: 'txn_001',
    type: 'CASHBACK',
    amount: 25.5,
    description: 'Cashback on purchase #12345',
    createdAt: '2025-09-15T14:30:00Z',
  },
  {
    id: 'txn_002',
    type: 'WITHDRAWAL',
    amount: -10.0,
    description: 'Withdrawal to Bank Account ****1234',
    createdAt: '2025-09-10T10:15:00Z',
  },
  {
    id: 'txn_003',
    type: 'REFERRAL_BONUS',
    amount: 15.0,
    description: 'Referral bonus for inviting user@example.com',
    createdAt: '2025-08-28T16:45:00Z',
  },
  {
    id: 'txn_004',
    type: 'CASHBACK',
    amount: 12.25,
    description: 'Cashback on purchase #12346',
    createdAt: '2025-08-15T09:20:00Z',
  },
  {
    id: 'txn_005',
    type: 'INCOME',
    amount: 50.0,
    description: 'Bonus credit',
    createdAt: '2025-07-30T11:00:00Z',
  },
];

describe('TransactionList', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('should group transactions by month with Spanish headers', async () => {
    render(<TransactionList />);

    expect(await screen.findByText(/Septiembre 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Agosto 2025/i)).toBeInTheDocument();
  });

  it('should display transactions in newest-first order', async () => {
    const { container } = render(<TransactionList />);

    await screen.findByText(/Septiembre 2025/i);

    const types = Array.from(
      container.querySelectorAll('.transaction-type')
    ).map((node) => node.textContent);

    expect(types).toEqual(['Cashback', 'Retiro de cuenta', 'Bono de referido']);
  });

  it('should show + prefix for incoming transactions with positive styling', async () => {
    render(<TransactionList />);

    await screen.findByText(/Septiembre 2025/i);

    const positiveAmount = screen.getByText(/\+\$25\.50/);
    expect(positiveAmount).toBeInTheDocument();
    expect(positiveAmount).toHaveClass('amount--incoming');
  });

  it('should show - prefix for outgoing transactions with negative styling', async () => {
    render(<TransactionList />);

    await screen.findByText(/Septiembre 2025/i);

    const negativeAmount = screen.getByText(/-\$10\.00/);
    expect(negativeAmount).toBeInTheDocument();
    expect(negativeAmount).toHaveClass('amount--outgoing');
  });

  it('should display empty state message when no transactions', async () => {
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

    expect(
      await screen.findByText(/Aún no tienes actividad/i)
    ).toBeInTheDocument();
  });

  it('should show skeleton placeholders while loading', () => {
    render(<TransactionList />);

    expect(
      screen.getByRole('status', { name: /cargando transacciones/i })
    ).toBeInTheDocument();
  });

  it('should show Spanish error message and retry button on error', async () => {
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

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/No pudimos cargar tus transacciones/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Intentar de nuevo/i })
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<TransactionList />);

    await screen.findByText(/Septiembre 2025/i);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should append transactions when "Load more" is clicked without layout jump', async () => {
    const { container } = render(<TransactionList />);

    await screen.findByText(/Septiembre 2025/i);

    const loadMoreButton = screen.getByRole('button', {
      name: /Cargar más transacciones/i,
    });

    const initialItems = container.querySelectorAll('.transaction-item');
    const initialCount = initialItems.length;
    const firstItemText = initialItems[0]?.textContent;

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      const updatedItems = container.querySelectorAll('.transaction-item');
      expect(updatedItems.length).toBeGreaterThan(initialCount);
    });

    const updatedFirstItem = container.querySelector('.transaction-item');
    expect(updatedFirstItem?.textContent).toBe(firstItemText);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /Cargar más transacciones/i })
      ).not.toBeInTheDocument();
    });
  });

  it('should disable "Load more" button while loading', async () => {
    server.use(
      http.get('/rewards/transactions', async ({ request }) => {
        const url = new URL(request.url);
        const cursor = url.searchParams.get('cursor');
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);

        if (!cursor) {
          const firstPage = mockTransactions.slice(0, Math.min(limit, 3));
          return HttpResponse.json({
            transactions: firstPage,
            nextCursor: 'cursor_page2',
            hasMore: true,
            count: mockTransactions.length,
          });
        }

        if (cursor === 'cursor_page2') {
          await delay(200);
          const secondPage = mockTransactions.slice(3);
          return HttpResponse.json({
            transactions: secondPage,
            nextCursor: null,
            hasMore: false,
            count: mockTransactions.length,
          });
        }

        return HttpResponse.json(
          {
            type: 'https://api.example.com/problems/invalid-cursor',
            title: 'Invalid Cursor',
            status: 400,
            detail: 'The provided cursor is invalid or expired',
          },
          { status: 400 }
        );
      })
    );

    render(<TransactionList />);

    await screen.findByText(/Septiembre 2025/i);

    const loadMoreButton = screen.getByRole('button', {
      name: /Cargar más transacciones/i,
    });

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(loadMoreButton).toBeDisabled();
    });
  });

  it('should hide "Load more" button when no more transactions', async () => {
    server.use(
      http.get('/rewards/transactions', () => {
        return HttpResponse.json({
          transactions: [mockTransactions[0]],
          nextCursor: null,
          hasMore: false,
          count: 1,
        });
      })
    );

    render(<TransactionList />);

    await screen.findByText(/Septiembre 2025/i);

    expect(
      screen.queryByRole('button', { name: /Cargar más transacciones/i })
    ).not.toBeInTheDocument();
  });

  it('should maintain month grouping when loading more transactions', async () => {
    render(<TransactionList />);

    await screen.findByText(/Septiembre 2025/i);

    const loadMoreButton = screen.getByRole('button', {
      name: /Cargar más transacciones/i,
    });

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /Cargar más transacciones/i })
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Septiembre 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Agosto 2025/i)).toBeInTheDocument();
  });
});
