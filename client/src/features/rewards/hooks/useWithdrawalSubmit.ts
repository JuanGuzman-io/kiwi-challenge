/**
 * useWithdrawalSubmit hook
 * Manages withdrawal submission state and API interaction
 * Per tasks T010: Encapsulates submission logic with isSubmitting, error, clearError
 */

import { useState, useCallback } from 'react';
import { submitWithdrawal as apiSubmitWithdrawal } from '../api/withdrawalsApi';
import type {
  WithdrawalRequest,
  WithdrawalResponse,
  ProblemDetails,
} from '../types/withdrawal.types';

export interface UseWithdrawalSubmitReturn {
  submitWithdrawal: (
    request: WithdrawalRequest
  ) => Promise<WithdrawalResponse>;
  isSubmitting: boolean;
  error: ProblemDetails | Error | null;
  clearError: () => void;
}

/**
 * Hook for managing withdrawal submission state
 *
 * @returns {UseWithdrawalSubmitReturn} Submission functions and state
 *
 * @example
 * const { submitWithdrawal, isSubmitting, error, clearError } = useWithdrawalSubmit();
 *
 * const handleSubmit = async () => {
 *   if (isSubmitting) return; // Guard against duplicates
 *   clearError();
 *   try {
 *     const result = await submitWithdrawal(request);
 *     // Handle success
 *   } catch (err) {
 *     // Error already set in state
 *   }
 * };
 */
export function useWithdrawalSubmit(): UseWithdrawalSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ProblemDetails | Error | null>(null);

  const submitWithdrawal = useCallback(
    async (request: WithdrawalRequest): Promise<WithdrawalResponse> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await apiSubmitWithdrawal(request);
        setIsSubmitting(false);
        return response;
      } catch (err) {
        setError(err as ProblemDetails | Error);
        setIsSubmitting(false);
        throw err; // Re-throw so caller can handle (e.g., navigation)
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submitWithdrawal,
    isSubmitting,
    error,
    clearError,
  };
}
