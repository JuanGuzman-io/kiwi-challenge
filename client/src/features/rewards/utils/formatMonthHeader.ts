/**
 * Month header formatting utility for transaction grouping
 * Per FR-006, FR-041: Format month group headers with Spanish month name and year
 * Per research.md: Native Intl API, zero dependencies
 */

/**
 * Formats month and year for transaction group headers
 * @param month - Spanish month name (e.g., "Septiembre")
 * @param year - Four-digit year (e.g., 2025)
 * @returns Formatted month header (e.g., "Septiembre 2025")
 */
export function formatMonthHeader(month: string, year: number): string {
  return `${month} ${year}`;
}

/**
 * Extracts Spanish month name from ISO 8601 date string
 * @param dateString - ISO 8601 date string (e.g., "2025-09-15T14:30:00Z")
 * @param locale - Locale for formatting (default: "es-ES")
 * @returns Capitalized Spanish month name (e.g., "Septiembre")
 */
export function getMonthName(
  dateString: string,
  locale: string = 'es-ES'
): string {
  const date = new Date(dateString);
  const monthName = new Intl.DateTimeFormat(locale, {
    month: 'long',
  }).format(date);

  // Capitalize first letter
  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}
