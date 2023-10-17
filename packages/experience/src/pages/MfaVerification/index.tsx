import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import MfaFactorList from '@/containers/MfaFactorList';
import useMfaFactorsState from '@/hooks/use-mfa-factors-state';
import { UserMfaFlow } from '@/types';

import ErrorPage from '../ErrorPage';

const MfaVerification = () => {
  const { availableFactors } = useMfaFactorsState() ?? {};

  if (!availableFactors || availableFactors.length === 0) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors" description="mfa.verify_mfa_description">
      <MfaFactorList flow={UserMfaFlow.MfaVerification} factors={availableFactors} />
    </SecondaryPageLayout>
  );
};

export default MfaVerification;
