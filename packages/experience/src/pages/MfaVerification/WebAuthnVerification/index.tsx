import { VerificationType } from '@logto/schemas';
import { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import Button from '@/components/Button';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useWebAuthnOperation from '@/hooks/use-webauthn-operation';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { webAuthnStateGuard } from '@/types/guard';
import { isWebAuthnOptions } from '@/utils/webauthn';

import styles from './index.module.scss';

const WebAuthnVerification = () => {
  const { state } = useLocation();
  const [, webAuthnState] = validate(state, webAuthnStateGuard);
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[VerificationType.WebAuthn];

  const handleWebAuthn = useWebAuthnOperation();
  const [isVerifying, setIsVerifying] = useState(false);

  if (!webAuthnState || !verificationId) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { options, availableFactors, skippable } = webAuthnState;

  if (!isWebAuthnOptions(options)) {
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
          isLoading={isVerifying}
          onClick={async () => {
            setIsVerifying(true);
            await handleWebAuthn(options, verificationId);
            setIsVerifying(false);
          }}
        />
      </SectionLayout>
      <SwitchMfaFactorsLink
        flow={UserMfaFlow.MfaVerification}
        flowState={{ availableFactors, skippable }}
      />
    </SecondaryPageLayout>
  );
};

export default WebAuthnVerification;
