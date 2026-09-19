import { AuthenticationContextMode } from '@logto/schemas';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { mfaBindingVerificationCodeStateGuard, mfaFlowStateGuard, parseGuard } from '@/types/guard';
import { getDisplayedStepUpMethods, toMfaFlowState } from '@/utils/step-up';

import useStepUpContext from './use-step-up-context';

const useMfaFlowState = () => {
  const { state } = useLocation();
  const { authenticationContext } = useStepUpContext();

  return useMemo(() => {
    if (authenticationContext?.mode === AuthenticationContextMode.StepUp) {
      return toMfaFlowState(
        getDisplayedStepUpMethods(authenticationContext.availableMethods),
        authenticationContext
      );
    }

    return (
      parseGuard(state, mfaFlowStateGuard) ??
      parseGuard(state, mfaBindingVerificationCodeStateGuard)?.mfaFlowState
    );
  }, [authenticationContext, state]);
};

export default useMfaFlowState;
