import { AuthenticationContextMode } from '@logto/schemas';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { UserMfaFlow } from '@/types';
import {
  type MfaFlowState,
  mfaBindingVerificationCodeStateGuard,
  mfaFlowStateGuard,
  parseGuard,
} from '@/types/guard';
import { getDisplayedStepUpMethods, toMfaFlowState } from '@/utils/step-up';

import useStepUpContext from './use-step-up-context';

const useMfaFlowState = (): MfaFlowState | undefined => {
  const { state, pathname } = useLocation();
  const { authenticationContext } = useStepUpContext();

  return useMemo(() => {
    if (authenticationContext?.mode === AuthenticationContextMode.StepUp) {
      if (!pathname.startsWith(`/${UserMfaFlow.MfaVerification}`)) {
        return {
          availableFactors: authenticationContext.enrollableFactors,
          isStepUp: true,
        };
      }

      return toMfaFlowState(
        getDisplayedStepUpMethods(authenticationContext.availableMethods),
        authenticationContext
      );
    }

    return (
      parseGuard(state, mfaFlowStateGuard) ??
      parseGuard(state, mfaBindingVerificationCodeStateGuard)?.mfaFlowState
    );
  }, [authenticationContext, pathname, state]);
};

export default useMfaFlowState;
