import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import { mfaFactorsStateGuard } from '@/types/guard';

const useMfaFactorsState = () => {
  const { state } = useLocation();
  const [, mfaFactorsState] = validate(state, mfaFactorsStateGuard);

  return mfaFactorsState;
};

export default useMfaFactorsState;
