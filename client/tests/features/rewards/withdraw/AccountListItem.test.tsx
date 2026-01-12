/**
 * Tests for AccountListItem component
 * Per tasks T023-T024: Test account display, selection, and keyboard navigation
 * Following TDD approach - write tests FIRST
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe } from 'jest-axe';
import type { BankAccount } from '../../../../src/features/rewards/types/bankAccount.types';

// Mock component import - will be implemented after tests
import { AccountListItem } from '../../../../src/features/rewards/components/withdraw/AccountListItem';

// Helper to render with Router
function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('AccountListItem', () => {
  const mockAccount: BankAccount = {
    id: 'bank-account-001',
    lastFourDigits: '1234',
    accountType: 'Checking',
    isActive: true,
    createdAt: '2026-01-11T17:49:07.082Z',
  };

  const mockOnSelect = vi.fn();

  // T023: Displays masked account number correctly
  it('should display masked account with bullets and last 4 digits', () => {
    renderWithRouter(
      <AccountListItem account={mockAccount} onSelect={mockOnSelect} />
    );

    // Should show •••• followed by last 4 digits
    expect(screen.getByText(/•••• 1234/)).toBeInTheDocument();
  });

  // T023: Displays account type
  it('should display account type', () => {
    renderWithRouter(
      <AccountListItem account={mockAccount} onSelect={mockOnSelect} />
    );

    expect(screen.getByText('Checking')).toBeInTheDocument();
  });

  // T023: Calls onSelect when clicked
  it('should call onSelect when clicked', () => {
    renderWithRouter(
      <AccountListItem account={mockAccount} onSelect={mockOnSelect} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnSelect).toHaveBeenCalledWith(mockAccount);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  // T024: Keyboard navigation with Enter key
  it('should call onSelect when Enter key is pressed', () => {
    renderWithRouter(
      <AccountListItem account={mockAccount} onSelect={mockOnSelect} />
    );

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    expect(mockOnSelect).toHaveBeenCalledWith(mockAccount);
  });

  // T024: Keyboard navigation with Space key
  it('should call onSelect when Space key is pressed', () => {
    renderWithRouter(
      <AccountListItem account={mockAccount} onSelect={mockOnSelect} />
    );

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });

    expect(mockOnSelect).toHaveBeenCalledWith(mockAccount);
  });

  // T024: Has proper ARIA label with account details
  it('should have accessible label with account type and last 4 digits', () => {
    renderWithRouter(
      <AccountListItem account={mockAccount} onSelect={mockOnSelect} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(/Checking.*1234/i);
  });

  // Accessibility test with jest-axe
  it('should have no accessibility violations', async () => {
    const { container } = renderWithRouter(
      <AccountListItem account={mockAccount} onSelect={mockOnSelect} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test with Savings account type
  it('should display Savings account type correctly', () => {
    const savingsAccount: BankAccount = {
      ...mockAccount,
      accountType: 'Savings',
      lastFourDigits: '5678',
    };

    renderWithRouter(
      <AccountListItem account={savingsAccount} onSelect={mockOnSelect} />
    );

    expect(screen.getByText('Savings')).toBeInTheDocument();
    expect(screen.getByText(/•••• 5678/)).toBeInTheDocument();
  });

  // Test button is keyboard focusable
  it('should be keyboard focusable', () => {
    renderWithRouter(
      <AccountListItem account={mockAccount} onSelect={mockOnSelect} />
    );

    const button = screen.getByRole('button');
    button.focus();

    expect(button).toHaveFocus();
  });
});
