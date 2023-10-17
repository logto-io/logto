import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import MfaFactorList from '@/containers/MfaFactorList';
import useMfaFactorsState from '@/hooks/use-mfa-factors-state';
import { UserMfaFlow } from '@/types';

import ErrorPage from '../ErrorPage';

const MfaBinding = () => {
  const { availableFactors } = useMfaFactorsState() ?? {};

  if (!availableFactors || availableFactors.length === 0) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout title="mfa.add_mfa_factors" description="mfa.add_mfa_description">
      <MfaFactorList flow={UserMfaFlow.MfaBinding} factors={availableFactors} />
    </SecondaryPageLayout>
  );
};

export default MfaBinding;
