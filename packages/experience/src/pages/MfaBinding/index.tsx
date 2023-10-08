import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import MfaFactorList from '@/containers/MfaFactorList';
import { UserMfaFlow } from '@/types';
import { mfaFactorsStateGuard } from '@/types/guard';

import ErrorPage from '../ErrorPage';

const MfaBinding = () => {
  const { state } = useLocation();
  const [, mfaFactorsState] = validate(state, mfaFactorsStateGuard);
  const { factors } = mfaFactorsState ?? {};

  if (!factors || factors.length === 0) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout title="mfa.add_mfa_factors" description="mfa.add_mfa_description">
      <MfaFactorList flow={UserMfaFlow.MfaBinding} factors={factors} />
    </SecondaryPageLayout>
  );
};

export default MfaBinding;
