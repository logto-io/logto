import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import TotpCodeVerification from '@/containers/TotpCodeVerification';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { mfaFactorsStateGuard } from '@/types/guard';

import * as styles from './index.module.scss';

const TotpVerification = () => {
  const { state } = useLocation();
  const [, mfaFactorsState] = validate(state, mfaFactorsStateGuard);

  if (!mfaFactorsState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { availableFactors } = mfaFactorsState;

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors">
      <SectionLayout
        title="mfa.enter_one_time_code"
        description="mfa.enter_one_time_code_description"
      >
        <TotpCodeVerification flow={UserMfaFlow.MfaVerification} />
      </SectionLayout>
      {availableFactors.length > 1 && (
        <SwitchMfaFactorsLink
          flow={UserMfaFlow.MfaVerification}
          factors={availableFactors}
          className={styles.switchFactorLink}
        />
      )}
    </SecondaryPageLayout>
  );
};

export default TotpVerification;
