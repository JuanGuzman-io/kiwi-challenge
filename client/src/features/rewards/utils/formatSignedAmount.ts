/**
 * Signed amount formatting utility
 * Per FR-008: Display signed amounts with +/- prefix
 * Per FR-009: Visual distinction between incoming and outgoing amounts
 */

import { formatCurrency } from './formatCurrency';

/**
 * Formats amount with explicit sign prefix (+/-)
 * @param amount - Signed amount (positive for incoming, negative for outgoing)
 * @param currency - ISO 4217 currency code (default: "USD")
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted amount with sign (e.g., "+$25.50" or "-$10.00")
 */
export function formatSignedAmount(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const formatted = formatCurrency(Math.abs(amount), currency, locale);
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${formatted}`;
}

/**
 * Determines if amount is incoming (positive) or outgoing (negative)
 * Used for applying CSS classes for visual distinction
 * @param amount - Signed amount
 * @returns "incoming" for positive amounts, "outgoing" for negative
 */
export function getAmountType(amount: number): 'incoming' | 'outgoing' {
  return amount >= 0 ? 'incoming' : 'outgoing';
}
