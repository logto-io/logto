import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import { mfaFlowStateGuard } from '@/types/guard';

const useMfaFlowState = () => {
  const { state } = useLocation();
  const [, mfaFlowState] = validate(state, mfaFlowStateGuard);

  return mfaFlowState;
};

export default useMfaFlowState;
