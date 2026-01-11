/**
 * EmptyState component
 * Displays message when no data is available
 * Per FR-028: Display "Aún no tienes actividad" when transaction history is empty
 */

interface EmptyStateProps {
  /**
   * Empty state message
   * @example "Aún no tienes actividad"
   */
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-message">{message}</p>
    </div>
  );
}
