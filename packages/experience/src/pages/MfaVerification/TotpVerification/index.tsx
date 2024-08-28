import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import TotpCodeVerification from '@/containers/TotpCodeVerification';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';

const TotpVerification = () => {
  const flowState = useMfaFlowState();

  if (!flowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors">
      <SectionLayout
        title="mfa.enter_one_time_code"
        description="mfa.enter_one_time_code_description"
      >
        <TotpCodeVerification flow={UserMfaFlow.MfaVerification} />
      </SectionLayout>
      <SwitchMfaFactorsLink
        flow={UserMfaFlow.MfaVerification}
        flowState={flowState}
        className={styles.switchFactorLink}
      />
    </SecondaryPageLayout>
  );
};

export default TotpVerification;
