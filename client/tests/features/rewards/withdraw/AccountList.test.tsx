/**
 * Component tests for AccountList
 * Per tasks T022, T037
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountList } from '../../../../src/features/rewards/components/withdraw/AccountList';
import { useBankAccounts } from '../../../../src/features/rewards/hooks/useBankAccounts';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';
import { ERROR_MESSAGES } from '../../../../src/features/rewards/constants/errorMessages';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../../src/features/rewards/hooks/useBankAccounts', () => ({
  useBankAccounts: vi.fn(),
}));

const accounts: BankAccount[] = [
  {
    id: 'bank-account-001',
    lastFourDigits: '1234',
    accountType: 'Checking',
    isActive: true,
    createdAt: '2026-01-11T17:49:07.082Z',
  },
  {
    id: 'bank-account-002',
    lastFourDigits: '5678',
    accountType: 'Savings',
    isActive: true,
    createdAt: '2026-01-11T17:49:07.091Z',
  },
];

describe('AccountList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render bank accounts list', async () => {
    vi.mocked(useBankAccounts).mockReturnValue({
      accounts,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AccountList />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText(/1234/)).toBeInTheDocument();
    expect(screen.getByText(/5678/)).toBeInTheDocument();
  });

  it('should show empty state when no accounts are available', async () => {
    vi.mocked(useBankAccounts).mockReturnValue({
      accounts: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AccountList />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText(ERROR_MESSAGES.NO_BANK_ACCOUNTS)).toBeInTheDocument();
  });
});
