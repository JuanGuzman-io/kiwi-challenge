/**
 * WithdrawSuccessScreen component
 * Displays confirmation details after a successful withdrawal submission
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { WithdrawSuccessLocationState } from '../../types/withdrawal.types';
import successCheck from '../../../../assets/success-check.png';
import { WithdrawFooter } from './WithdrawFooter';
import { WithdrawSuccessScreenSkeleton } from './WithdrawSuccessScreenSkeleton';
import '../../styles/withdraw.css';
import '../../styles/withdrawSuccess.css';

export function WithdrawSuccessScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const state = location.state as WithdrawSuccessLocationState | null;
  const withdrawalData = state?.withdrawalData;

  useEffect(() => {
    if (!withdrawalData) {
      navigate('/withdraw', { replace: true });
      return;
    }

    titleRef.current?.focus();
  }, [withdrawalData, navigate]);

  if (!withdrawalData) {
    return <WithdrawSuccessScreenSkeleton />;
  }

  return (
    <div className="withdraw-success-screen">
      <div className="success-body">
        <div className="success-visual">
          {imageFailed ? (
            <div className="success-fallback" aria-hidden="true">
              ✓
            </div>
          ) : (
            <img
              src={successCheck}
              alt="Retiro exitoso"
              className="success-image"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <h1 ref={titleRef} tabIndex={-1} className="success-title">
          ¡Tu retiro fue exitoso!
        </h1>
        <p className="success-description">
          Procesamos tu solicitud y enviamos tu recompensa a tu cuenta bancaria
          terminada en {withdrawalData.lastFourDigits}.
        </p>
      </div>

      <WithdrawFooter>
        <button
          type="button"
          className="success-action-button"
          onClick={() => navigate('/rewards')}
        >
          Regresar a Rewards
        </button>
      </WithdrawFooter>
    </div>
  );
}
