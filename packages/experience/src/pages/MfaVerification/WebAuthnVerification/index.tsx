import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import Button from '@/components/Button';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useMfaFactorsState from '@/hooks/use-mfa-factors-state';
import useWebAuthnOperation from '@/hooks/use-webauthn-operation';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';

const WebAuthnVerification = () => {
  const mfaFactorsState = useMfaFactorsState();
  const verifyWebAuthn = useWebAuthnOperation(UserMfaFlow.MfaVerification);

  if (!mfaFactorsState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { availableFactors } = mfaFactorsState;

  return (
    <SecondaryPageLayout title="mfa.verify_mfa_factors">
      <SectionLayout
        title="mfa.verify_via_passkey"
        description="mfa.verify_via_passkey_description"
      >
        <Button
          title="action.verify_via_passkey"
          className={styles.verifyButton}
          onClick={verifyWebAuthn}
        />
      </SectionLayout>
      {availableFactors.length > 1 && (
        <SwitchMfaFactorsLink flow={UserMfaFlow.MfaVerification} factors={availableFactors} />
      )}
    </SecondaryPageLayout>
  );
};

export default WebAuthnVerification;
