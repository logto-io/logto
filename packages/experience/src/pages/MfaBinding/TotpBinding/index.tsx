import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SwitchIcon from '@/assets/icons/switch-icon.svg';
import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { totpBindingStateGuard } from '@/types/guard';

import SecretSection from './SecretSection';
import VerificationSection from './VerificationSection';
import * as styles from './index.module.scss';

const TotpBinding = () => {
  const { state } = useLocation();
  const [, totpBindingState] = validate(state, totpBindingStateGuard);

  if (!totpBindingState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout title="mfa.add_authenticator_app">
      <div className={styles.container}>
        <SecretSection {...totpBindingState} />
        <Divider />
        <VerificationSection />
        <Divider />
        {totpBindingState.allowOtherFactors && (
          <TextLink
            to={`/${UserMfaFlow.MfaBinding}`}
            text="mfa.link_another_mfa_factor"
            icon={<SwitchIcon />}
          />
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default TotpBinding;
