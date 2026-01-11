/**
 * Date formatting utility using native Intl.DateTimeFormat
 * Per research.md: Native API for Spanish locale, zero dependencies
 * Per FR-006, FR-041: Format dates in Spanish locale
 */

/**
 * Formats an ISO 8601 date string for display
 * @param dateString - ISO 8601 date string (e.g., "2025-09-15T14:30:00Z")
 * @param locale - Locale for formatting (default: "es-ES" for Spanish)
 * @returns Formatted date string (e.g., "15 sep. 2025")
 */
export function formatDate(
  dateString: string,
  locale: string = 'es-ES'
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
