import { VerificationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import TrustedDeviceOptIn from '@/containers/TrustedDeviceOptIn';
import useSkipMfa from '@/hooks/use-skip-mfa';
import useSkipOptionalMfa from '@/hooks/use-skip-optional-mfa';
import useTrustedDeviceOptIn from '@/hooks/use-trusted-device-opt-in';
import useWebAuthnOperation from '@/hooks/use-webauthn-operation';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';
import { UserMfaFlow } from '@/types';
import { webAuthnStateGuard } from '@/types/guard';
import { isWebAuthnOptions } from '@/utils/webauthn';

import styles from './index.module.scss';

const WebAuthnBinding = () => {
  const { state } = useLocation();
  const [, webAuthnState] = validate(state, webAuthnStateGuard);
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[VerificationType.WebAuthn];
  const isSessionValid = Boolean(
    webAuthnState && verificationId && isWebAuthnOptions(webAuthnState.options)
  );

  const handleWebAuthn = useWebAuthnOperation();
  const { durationDays, isChecked, setIsChecked, createTrustedDevice } =
    useTrustedDeviceOptIn(isSessionValid);
  const skipMfa = useSkipMfa();
  const skipOptionalMfa = useSkipOptionalMfa();
  const [isCreatingPasskey, setIsCreatingPasskey] = useState(false);

  if (!webAuthnState || !verificationId) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { options, ...mfaFlowState } = webAuthnState;
  const { skippable, suggestion } = mfaFlowState;

  if (!isWebAuthnOptions(options)) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout
      title="mfa.create_a_passkey"
      description="mfa.create_passkey_description"
      onSkip={conditional(skippable && (suggestion ? skipOptionalMfa : skipMfa))}
    >
      <TrustedDeviceOptIn
        durationDays={durationDays}
        isChecked={isChecked}
        className={styles.optIn}
        onChange={setIsChecked}
      />
      <Button
        title="mfa.create_a_passkey"
        isLoading={isCreatingPasskey}
        onClick={async () => {
          setIsCreatingPasskey(true);
          await handleWebAuthn(options, verificationId, createTrustedDevice);
          setIsCreatingPasskey(false);
        }}
      />
      <SwitchMfaFactorsLink
        flow={UserMfaFlow.MfaBinding}
        flowState={mfaFlowState}
        className={styles.switchLink}
      />
    </SecondaryPageLayout>
  );
};

export default WebAuthnBinding;
