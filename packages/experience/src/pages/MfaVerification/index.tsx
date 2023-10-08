import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import MfaFactorList from '@/containers/MfaFactorList';
import { UserMfaFlow } from '@/types';
import { mfaFactorsStateGuard } from '@/types/guard';

import ErrorPage from '../ErrorPage';

const MfaVerification = () => {
  const { state } = useLocation();
  const [, mfaFactorsState] = validate(state, mfaFactorsStateGuard);
  const { factors } = mfaFactorsState ?? {};

  if (!factors || factors.length === 0) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors" description="mfa.verify_mfa_description">
      <MfaFactorList flow={UserMfaFlow.MfaVerification} factors={factors} />
    </SecondaryPageLayout>
  );
};

export default MfaVerification;
