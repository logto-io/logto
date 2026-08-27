import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { mfaBindingVerificationCodeStateGuard, mfaFlowStateGuard, parseGuard } from '@/types/guard';

const useMfaFlowState = () => {
  const { state } = useLocation();

  return useMemo(
    () =>
      parseGuard(state, mfaFlowStateGuard) ??
      parseGuard(state, mfaBindingVerificationCodeStateGuard)?.mfaFlowState,
    [state]
  );
};

export default useMfaFlowState;
