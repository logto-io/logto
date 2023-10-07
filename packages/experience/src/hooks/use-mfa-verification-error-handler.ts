import { MfaFactor } from '@logto/schemas';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserMfaFlow } from '@/types';
import {
  type MfaFactorsState,
  missingMfaFactorsErrorDataGuard,
  requireMfaFactorsErrorDataGuard,
  type TotpVerificationState,
} from '@/types/guard';

import type { ErrorHandlers } from './use-error-handler';
import useStartTotpBinding from './use-start-binding-totp';
import useToast from './use-toast';

export type Options = {
  replace?: boolean;
};

const useMfaVerificationErrorHandler = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const startBindingTotp = useStartTotpBinding({ replace });

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
          const state: MfaFactorsState = { factors: missingFactors };
          navigate({ pathname: `/${UserMfaFlow.MfaBinding}` }, { replace, state });
          return;
        }

        const factor = missingFactors[0];

        if (factor === MfaFactor.TOTP) {
          void startBindingTotp();
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
          const state: MfaFactorsState = { factors: availableFactors };
          navigate({ pathname: `/${UserMfaFlow.MfaVerification}` }, { replace, state });
          return;
        }

        const factor = availableFactors[0];
        if (!factor) {
          setToast(error.message);
          return;
        }

        if (factor === MfaFactor.TOTP) {
          const state: TotpVerificationState = { allowOtherFactors: false };
          navigate({ pathname: `/${UserMfaFlow.MfaVerification}/${factor}` }, { replace, state });
        }
        // Todo: @xiaoyijun handle other factors
      },
    }),
    [navigate, replace, setToast, startBindingTotp]
  );

  return mfaVerificationErrorHandler;
};

export default useMfaVerificationErrorHandler;
