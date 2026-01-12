/**
 * Integration test for withdraw account selection flow
 * Per task T025
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { WithdrawScreen } from '../../../../src/features/rewards/components/withdraw/WithdrawScreen';
import { AccountList } from '../../../../src/features/rewards/components/withdraw/AccountList';
import { useRewardsSummary } from '../../../../src/features/rewards/hooks/useRewardsSummary';
import { useBankAccounts } from '../../../../src/features/rewards/hooks/useBankAccounts';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';

vi.mock('../../../../src/features/rewards/hooks/useRewardsSummary', () => ({
  useRewardsSummary: vi.fn(),
}));

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

function renderFlow() {
  return render(
    <MemoryRouter initialEntries={['/withdraw']}>
      <Routes>
        <Route path="/withdraw" element={<WithdrawScreen />} />
        <Route path="/withdraw/accounts" element={<AccountList />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('withdraw account selection flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useRewardsSummary).mockReturnValue({
      data: { balance: 1234.56, currency: 'USD' },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useBankAccounts).mockReturnValue({
      accounts,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow selecting an account and enable submit button', async () => {
    renderFlow();

    await act(async () => {
      vi.runAllTimers();
    });

    const submitButton = screen.getByRole('button', {
      name: /Retirar fondos/i,
    });
    expect(submitButton).toBeDisabled();

    const selectorButton = screen.getByRole('button', {
      name: /Selecciona una cuenta bancaria/i,
    });
    fireEvent.click(selectorButton);

    await act(async () => {
      vi.runAllTimers();
    });

    const accountButton = screen.getByRole('button', {
      name: /Cuenta Checking/i,
    });
    fireEvent.click(accountButton);

    await act(async () => {
      vi.runAllTimers();
    });

    const enabledButton = screen.getByRole('button', {
      name: /Retirar fondos/i,
    });
    expect(enabledButton).not.toBeDisabled();
  });
});
