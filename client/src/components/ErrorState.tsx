/**
 * ErrorState component
 * Displays user-friendly error message with retry action
 * Per FR-033, FR-034: Display error message with retry action when API fails
 * Per clarification: User-friendly Spanish error messages
 */

interface ErrorStateProps {
  /**
   * User-friendly error message in Spanish
   * @example "No pudimos cargar tu balance. Por favor, intenta de nuevo."
   */
  message: string;

  /**
   * Callback for retry button
   */
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert" aria-live="assertive">
      <p className="error-message">{message}</p>
      <button
        className="error-retry-button"
        onClick={onRetry}
        aria-label="Intentar de nuevo"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
