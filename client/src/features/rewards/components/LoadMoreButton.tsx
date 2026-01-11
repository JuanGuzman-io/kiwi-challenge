/**
 * LoadMoreButton component
 * Per FR-016: Support pagination with "Load more" button
 * Per FR-018: Disable "Load more" button while loading next page
 * Per FR-019: Hide/disable "Load more" when all transactions loaded
 */

interface LoadMoreButtonProps {
  /**
   * Whether more transactions exist to load
   */
  hasMore: boolean;

  /**
   * Whether currently loading more transactions
   */
  loadingMore: boolean;

  /**
   * Callback when button is clicked
   */
  onLoadMore: () => void;
}

export function LoadMoreButton({
  hasMore,
  loadingMore,
  onLoadMore,
}: LoadMoreButtonProps) {
  // Don't render if no more items to load
  if (!hasMore) {
    return null;
  }

  return (
    <div className="load-more-container">
      <button
        className="load-more-button"
        onClick={onLoadMore}
        disabled={loadingMore}
        aria-label={loadingMore ? 'Cargando más transacciones' : 'Cargar más transacciones'}
        aria-busy={loadingMore}
      >
        {loadingMore ? 'Cargando...' : 'Cargar más'}
      </button>
    </div>
  );
}
