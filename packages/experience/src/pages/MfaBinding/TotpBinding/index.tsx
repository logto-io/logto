import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import Divider from '@/components/Divider';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
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

  const { availableFactors } = totpBindingState;

  return (
    <SecondaryPageLayout title="mfa.add_authenticator_app">
      <div className={styles.container}>
        <SecretSection {...totpBindingState} />
        <Divider />
        <VerificationSection />
        {availableFactors.length > 1 && (
          <>
            <Divider />
            <SwitchMfaFactorsLink
              flow={UserMfaFlow.MfaBinding}
              factors={availableFactors}
              className={styles.switchLink}
            />
          </>
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default TotpBinding;
