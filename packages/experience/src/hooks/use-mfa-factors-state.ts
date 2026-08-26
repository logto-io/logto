import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import { mfaBindingVerificationCodeStateGuard, mfaFlowStateGuard } from '@/types/guard';

const useMfaFlowState = () => {
  const { state } = useLocation();
  const [, mfaFlowState] = validate(state, mfaFlowStateGuard);
  const [, verificationCodeState] = validate(state, mfaBindingVerificationCodeStateGuard);

  return mfaFlowState ?? verificationCodeState?.mfaFlowState;
};

export default useMfaFlowState;
