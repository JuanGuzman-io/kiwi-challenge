/**
 * Accessibility tests for withdraw feature
 * Per tasks T039, T068-T070
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WithdrawScreen } from '../../../../src/features/rewards/components/withdraw/WithdrawScreen';
import { AccountList } from '../../../../src/features/rewards/components/withdraw/AccountList';
import { AccountListItem } from '../../../../src/features/rewards/components/withdraw/AccountListItem';
import { AccountSelector } from '../../../../src/features/rewards/components/withdraw/AccountSelector';
import { useRewardsSummary } from '../../../../src/features/rewards/hooks/useRewardsSummary';
import { useBankAccounts } from '../../../../src/features/rewards/hooks/useBankAccounts';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';

expect.extend(toHaveNoViolations);

vi.mock('../../../../src/features/rewards/hooks/useRewardsSummary', () => ({
  useRewardsSummary: vi.fn(),
}));

vi.mock('../../../../src/features/rewards/hooks/useBankAccounts', () => ({
  useBankAccounts: vi.fn(),
}));

const account: BankAccount = {
  id: 'bank-account-001',
  lastFourDigits: '1234',
  accountType: 'Checking',
  isActive: true,
  createdAt: '2026-01-11T17:49:07.082Z',
};

describe('withdraw accessibility', () => {
  beforeEach(() => {
    vi.mocked(useRewardsSummary).mockReturnValue({
      data: { balance: 1234.56, currency: 'USD' },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useBankAccounts).mockReturnValue({
      accounts: [account],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('WithdrawScreen should have no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter
        initialEntries={[{ pathname: '/withdraw', state: { selectedAccount: account } }]}
      >
        <Routes>
          <Route path="/withdraw" element={<WithdrawScreen />} />
        </Routes>
      </MemoryRouter>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AccountList should have no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <AccountList />
      </MemoryRouter>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AccountListItem should have no accessibility violations', async () => {
    const { container } = render(
      <AccountListItem account={account} onSelect={vi.fn()} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AccountSelector loading state should be accessible', async () => {
    const { container } = render(
      <MemoryRouter>
        <AccountSelector selectedAccount={null} loading />
      </MemoryRouter>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
