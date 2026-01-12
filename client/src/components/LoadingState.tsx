/**
 * LoadingState component
 * Displays skeleton placeholder during async data loading
 * Per FR-025, FR-026: Display skeleton/loader placeholders while loading
 */

interface LoadingStateProps {
  /**
   * Type of loading state (affects skeleton structure)
   */
  type?: 'balance' | 'transactions' | 'pagination';
}

export function LoadingState({ type = 'balance' }: LoadingStateProps) {
  if (type === 'balance') {
    return (
      <div className="loading-state balance" role="status" aria-live="polite" aria-label="Cargando balance">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-amount"></div>
        <div className="skeleton skeleton-button"></div>
      </div>
    );
  }

  if (type === 'transactions') {
    return (
      <div className="loading-state transactions" role="status" aria-live="polite" aria-label="Cargando transacciones">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton skeleton-transaction">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-amount"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'pagination') {
    return (
      <div className="loading-state pagination" role="status" aria-live="polite" aria-label="Cargando más transacciones">
        <div className="skeleton skeleton-spinner"></div>
      </div>
    );
  }

  return null;
}
