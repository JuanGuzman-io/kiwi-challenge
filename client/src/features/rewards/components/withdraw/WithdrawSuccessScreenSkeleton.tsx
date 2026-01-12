/**
 * WithdrawSuccessScreenSkeleton component
 * Placeholder skeleton for success screen transitions
 */

export function WithdrawSuccessScreenSkeleton() {
  return (
    <div
      className="withdraw-success-screen withdraw-success-screen--skeleton"
      aria-live="polite"
    >
      <div className="skeleton success-skeleton-image"></div>
      <div className="skeleton success-skeleton-title"></div>
      <div className="skeleton success-skeleton-description"></div>
      <div className="skeleton success-skeleton-button"></div>
    </div>
  );
}
