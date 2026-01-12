/**
 * WithdrawWarningCard component
 * Displays cooldown warning message with brake illustration
 */

import warningIllustration from '../../../../assets/brake-warning-illustration.png';

export function WithdrawWarningCard() {
  return (
    <div className="withdraw-warning-card" role="note">
      <img
        src={warningIllustration}
        alt="Advertencia"
        className="withdraw-warning-icon"
        width={32}
        height={32}
      />
      <p className="withdraw-warning-text">
        <strong>Debes esperar unos minutos </strong>
        antes de realizar otro retiro con el mismo monto.
      </p>
    </div>
  );
}
