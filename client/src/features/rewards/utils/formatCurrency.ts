/**
 * Currency formatting utility using native Intl.NumberFormat
 * Per research.md: Native API, zero dependencies, full browser support
 * Per FR-038: Format currency consistently across the application
 */

/**
 * Formats a number as currency with locale-specific formatting
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code (e.g., "USD")
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
