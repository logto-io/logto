import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import MfaFactorList from '@/containers/MfaFactorList';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import { UserMfaFlow } from '@/types';

import ErrorPage from '../ErrorPage';

const MfaVerification = () => {
  const flowState = useMfaFlowState();

  if (!flowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors" description="mfa.verify_mfa_description">
      <MfaFactorList flow={UserMfaFlow.MfaVerification} flowState={flowState} />
    </SecondaryPageLayout>
  );
};

export default MfaVerification;
