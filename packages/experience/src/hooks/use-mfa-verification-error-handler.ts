import { MfaFactor } from '@logto/schemas';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserMfaFlow } from '@/types';
import {
  type MfaFactorsState,
  missingMfaFactorsErrorDataGuard,
  requireMfaFactorsErrorDataGuard,
} from '@/types/guard';

import type { ErrorHandlers } from './use-error-handler';
import useStartTotpBinding from './use-start-totp-binding';
import useToast from './use-toast';

export type Options = {
  replace?: boolean;
};

const useMfaVerificationErrorHandler = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const startTotpBinding = useStartTotpBinding({ replace });

  const mfaVerificationErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_mfa': (error) => {
        const [_, data] = validate(error.data, missingMfaFactorsErrorDataGuard);
        const missingFactors = data?.missingFactors ?? [];

        if (missingFactors.length === 0) {
          setToast(error.message);
          return;
        }

        if (missingFactors.length > 1) {
          navigate(
            { pathname: `/${UserMfaFlow.MfaBinding}` },
            { replace, state: { availableFactors: missingFactors } satisfies MfaFactorsState }
          );
          return;
        }

        const factor = missingFactors[0];

        if (factor === MfaFactor.TOTP) {
          void startTotpBinding(missingFactors);
          return;
        }

        if (factor === MfaFactor.WebAuthn) {
          navigate(
            { pathname: `/${UserMfaFlow.MfaBinding}/${factor}` },
            { replace, state: { availableFactors: missingFactors } satisfies MfaFactorsState }
          );
        }
        // Todo: @xiaoyijun handle other factors
      },
      'session.mfa.require_mfa_verification': async (error) => {
        const [_, data] = validate(error.data, requireMfaFactorsErrorDataGuard);
        const availableFactors = data?.availableFactors ?? [];
        if (availableFactors.length === 0) {
          setToast(error.message);
          return;
        }

        if (availableFactors.length > 1) {
          navigate(
            { pathname: `/${UserMfaFlow.MfaVerification}` },
            { replace, state: { availableFactors } satisfies MfaFactorsState }
          );
          return;
        }

        const factor = availableFactors[0];
        if (!factor) {
          setToast(error.message);
          return;
        }

        if (factor === MfaFactor.TOTP || factor === MfaFactor.WebAuthn) {
          navigate(
            { pathname: `/${UserMfaFlow.MfaVerification}/${factor}` },
            { replace, state: { availableFactors } satisfies MfaFactorsState }
          );
        }
        // Todo: @xiaoyijun handle other factors
      },
    }),
    [navigate, replace, setToast, startTotpBinding]
  );

  return mfaVerificationErrorHandler;
};

export default useMfaVerificationErrorHandler;
