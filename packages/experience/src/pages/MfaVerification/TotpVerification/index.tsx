import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import SwitchIcon from '@/assets/icons/switch-icon.svg';
import TextLink from '@/components/TextLink';
import TotpCodeVerification from '@/containers/TotpCodeVerification';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { totpVerificationStateGuard } from '@/types/guard';

import * as styles from './index.module.scss';

const TotpVerification = () => {
  const { state } = useLocation();
  const [, totpVerificationState] = validate(state, totpVerificationStateGuard);

  if (!totpVerificationState) {
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
      {totpVerificationState.allowOtherFactors && (
        <TextLink
          to={`/${UserMfaFlow.MfaVerification}`}
          text="mfa.try_another_verification_method"
          icon={<SwitchIcon />}
          className={styles.switchFactorLink}
        />
      )}
    </SecondaryPageLayout>
  );
};

export default TotpVerification;
