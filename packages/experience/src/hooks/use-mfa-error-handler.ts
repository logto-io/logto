import { MfaFactor, type RequestErrorBody } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserMfaFlow } from '@/types';
import { type MfaFactorsState, mfaErrorDataGuard } from '@/types/guard';

import type { ErrorHandlers } from './use-error-handler';
import useStartTotpBinding from './use-start-totp-binding';
import useToast from './use-toast';

export type Options = {
  replace?: boolean;
};

const useMfaErrorHandler = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const startTotpBinding = useStartTotpBinding({ replace });

  const handleMfaRedirect = useCallback(
    (flow: UserMfaFlow, availableFactors: MfaFactor[]) => {
      const mfaFactorsState: MfaFactorsState = {
        availableFactors,
      };

      if (availableFactors.length > 1) {
        navigate({ pathname: `/${flow}` }, { replace, state: mfaFactorsState });
        return;
      }

      const factor = availableFactors[0];

      if (!factor) {
        return;
      }

      if (factor === MfaFactor.TOTP && flow === UserMfaFlow.MfaBinding) {
        void startTotpBinding(availableFactors);
        return;
      }

      navigate({ pathname: `/${flow}/${factor}` }, { replace, state: mfaFactorsState });
    },
    [navigate, replace, startTotpBinding]
  );

  const handleMfaError = useCallback(
    (flow: UserMfaFlow) => {
      return (error: RequestErrorBody) => {
        const [_, data] = validate(error.data, mfaErrorDataGuard);
        const availableFactors = data?.availableFactors ?? [];

        if (availableFactors.length === 0) {
          setToast(error.message);
          return;
        }

        handleMfaRedirect(flow, availableFactors);
      };
    },
    [handleMfaRedirect, setToast]
  );

  const mfaVerificationErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_mfa': handleMfaError(UserMfaFlow.MfaBinding),
      'session.mfa.require_mfa_verification': handleMfaError(UserMfaFlow.MfaVerification),
    }),
    [handleMfaError]
  );

  return mfaVerificationErrorHandler;
};

export default useMfaErrorHandler;
