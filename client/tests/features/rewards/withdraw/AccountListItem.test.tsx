/**
 * Component tests for AccountListItem
 * Per tasks T023-T024
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountListItem } from '../../../../src/features/rewards/components/withdraw/AccountListItem';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';

const account: BankAccount = {
  id: 'bank-account-001',
  lastFourDigits: '1234',
  accountType: 'Checking',
  isActive: true,
  createdAt: '2026-01-11T17:49:07.082Z',
};

describe('AccountListItem', () => {
  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn();

    render(<AccountListItem account={account} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Cuenta Checking/i }));

    expect(onSelect).toHaveBeenCalledWith(account);
  });

  it('should call onSelect when Enter is pressed', () => {
    const onSelect = vi.fn();

    render(<AccountListItem account={account} onSelect={onSelect} />);

    const button = screen.getByRole('button', { name: /Cuenta Checking/i });
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(account);
  });

  it('should call onSelect when Space is pressed', () => {
    const onSelect = vi.fn();

    render(<AccountListItem account={account} onSelect={onSelect} />);

    const button = screen.getByRole('button', { name: /Cuenta Checking/i });
    fireEvent.keyDown(button, { key: ' ' });

    expect(onSelect).toHaveBeenCalledWith(account);
  });
});
