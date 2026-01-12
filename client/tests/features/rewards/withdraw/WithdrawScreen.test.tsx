/**
 * Component tests for WithdrawScreen
 * Per tasks T018-T019, T047-T049
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { WithdrawScreen } from '../../../../src/features/rewards/components/withdraw/WithdrawScreen';
import { useRewardsSummary } from '../../../../src/features/rewards/hooks/useRewardsSummary';
import { useBankAccounts } from '../../../../src/features/rewards/hooks/useBankAccounts';
import { submitWithdrawal } from '../../../../src/features/rewards/api/withdrawalsApi';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';
import { ERROR_MESSAGES } from '../../../../src/features/rewards/constants/errorMessages';

vi.mock('../../../../src/features/rewards/hooks/useRewardsSummary', () => ({
  useRewardsSummary: vi.fn(),
}));

vi.mock('../../../../src/features/rewards/hooks/useBankAccounts', () => ({
  useBankAccounts: vi.fn(),
}));

vi.mock('../../../../src/features/rewards/api/withdrawalsApi', () => ({
  submitWithdrawal: vi.fn(),
}));

const selectedAccount: BankAccount = {
  id: 'bank-account-001',
  lastFourDigits: '1234',
  accountType: 'Checking',
  isActive: true,
  createdAt: '2026-01-11T17:49:07.082Z',
};

function renderWithdrawScreen(state?: { selectedAccount?: BankAccount | null }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/withdraw', state }]}> 
      <Routes>
        <Route path="/withdraw" element={<WithdrawScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('WithdrawScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useRewardsSummary).mockReturnValue({
      data: { balance: 1234.56, currency: 'USD' },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useBankAccounts).mockReturnValue({
      accounts: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(submitWithdrawal).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render formatted balance amount', async () => {
    renderWithdrawScreen();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument();
  });

  it('should disable submit button when no account is selected', async () => {
    renderWithdrawScreen();

    await act(async () => {
      vi.runAllTimers();
    });

    const button = screen.getByRole('button', {
      name: /Retirar fondos/i,
    });
    expect(button).toBeDisabled();
  });

  it('should disable submit button and show loading text while submitting', async () => {
    const deferred = createDeferred({});
    vi.mocked(submitWithdrawal).mockReturnValueOnce(deferred.promise as never);

    renderWithdrawScreen({ selectedAccount });

    await act(async () => {
      vi.runAllTimers();
    });

    const button = screen.getByRole('button', {
      name: /Retirar fondos/i,
    });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Procesando...');
  });

  it('should prevent duplicate submissions on rapid clicks', async () => {
    const deferred = createDeferred({});
    vi.mocked(submitWithdrawal).mockReturnValue(deferred.promise as never);

    renderWithdrawScreen({ selectedAccount });

    await act(async () => {
      vi.runAllTimers();
    });

    const button = screen.getByRole('button', {
      name: /Retirar fondos/i,
    });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(button).toBeDisabled();
    expect(vi.mocked(submitWithdrawal)).toHaveBeenCalledTimes(1);

    fireEvent.click(button);

    expect(vi.mocked(submitWithdrawal)).toHaveBeenCalledTimes(1);
  });

  it('should submit withdrawal with correct payload when account is selected', async () => {
    vi.mocked(submitWithdrawal).mockResolvedValueOnce({
      id: 'withdrawal-001',
      userId: 'test-user-001',
      amount: 1234.56,
      bankAccountId: selectedAccount.id,
      currency: 'USD',
      status: 'pending',
      createdAt: '2026-01-11T17:49:07.082Z',
    });

    renderWithdrawScreen({ selectedAccount });

    await act(async () => {
      vi.runAllTimers();
    });

    const button = screen.getByRole('button', {
      name: /Retirar fondos/i,
    });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(vi.mocked(submitWithdrawal)).toHaveBeenCalledWith({
      amount: 1234.56,
      bankAccountId: selectedAccount.id,
      currency: 'USD',
    });
  });

  it('should display specific error message for 404 bank account not found', async () => {
    vi.mocked(submitWithdrawal).mockRejectedValueOnce({
      status: 404,
      detail: 'Account not found',
    });

    renderWithdrawScreen({ selectedAccount });

    await act(async () => {
      vi.runAllTimers();
    });

    const button = screen.getByRole('button', {
      name: /Retirar fondos/i,
    });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(
      screen.getByText(ERROR_MESSAGES.BANK_ACCOUNT_NOT_FOUND)
    ).toBeInTheDocument();
  });

  it('should show error detail text when provided and allow retry to clear error', async () => {
    vi.mocked(submitWithdrawal).mockRejectedValueOnce({
      status: 500,
      detail: 'Detalles del error',
    });

    renderWithdrawScreen({ selectedAccount });

    await act(async () => {
      vi.runAllTimers();
    });

    const button = screen.getByRole('button', {
      name: /Retirar fondos/i,
    });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(screen.getByText(/Detalles del error/i)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }));
      await Promise.resolve();
    });

    expect(screen.queryByText(/Detalles del error/i)).not.toBeInTheDocument();
  });

  it('should render cooldown warning card', async () => {
    renderWithdrawScreen();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(
      screen.getByText(/Debes esperar unos minutos/i)
    ).toBeInTheDocument();
  });
});
