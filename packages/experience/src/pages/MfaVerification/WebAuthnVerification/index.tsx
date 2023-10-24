import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import Button from '@/components/Button';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useWebAuthnOperation from '@/hooks/use-webauthn-operation';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';

const WebAuthnVerification = () => {
  const flowState = useMfaFlowState();
  const verifyWebAuthn = useWebAuthnOperation(UserMfaFlow.MfaVerification);

  if (!flowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

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
      <SwitchMfaFactorsLink flow={UserMfaFlow.MfaVerification} flowState={flowState} />
    </SecondaryPageLayout>
  );
};

export default WebAuthnVerification;
