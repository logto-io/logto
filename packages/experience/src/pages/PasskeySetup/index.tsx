import { type WebAuthnRegistrationOptions } from '@logto/schemas';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useCallback, useEffect, useState } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import { createPasskeySignInRegistrationOptions } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import usePasskeySignIn from '@/hooks/use-passkey-sign-in';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';

import styles from './index.module.scss';

type RegistrationState = {
  verificationId: string;
  options: WebAuthnRegistrationOptions;
};

const PasskeySetup = () => {
  const { registerPasskeyForSignIn } = usePasskeySignIn();
  const handleError = useErrorHandler();
  const asyncCreateRegistration = useApi(createPasskeySignInRegistrationOptions);

  const [registrationResult, setRegistrationResult] = useState<RegistrationState>();
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!browserSupportsWebAuthn()) {
      return;
    }

    (async () => {
      setIsPreparing(true);
      const [error, result] = await asyncCreateRegistration();
      setIsPreparing(false);

      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        setRegistrationResult(result);
      }
    })();
  }, [asyncCreateRegistration, handleError]);

  const onCreatePasskey = useCallback(async () => {
    if (!registrationResult) {
      return;
    }

    setIsSubmitting(true);
    await registerPasskeyForSignIn(registrationResult.options, registrationResult.verificationId);
    setIsSubmitting(false);
  }, [registerPasskeyForSignIn, registrationResult]);

  const onSkip = useCallback(() => {
    // Skip adding passkey for sign-in and redirect to the next step
  }, []);

  if (!browserSupportsWebAuthn()) {
    return <ErrorPage title="mfa.webauthn_not_supported" />;
  }

  return (
    <SecondaryPageLayout title="passkey_sign_in.setup_page.title" onSkip={onSkip}>
      <SectionLayout
        title="passkey_sign_in.setup_page.subtitle"
        description="passkey_sign_in.setup_page.description"
      >
        <Button
          className={styles.button}
          title="passkey_sign_in.setup_page.subtitle"
          isLoading={isSubmitting || isPreparing}
          disabled={isPreparing && !registrationResult}
          onClick={onCreatePasskey}
        />
      </SectionLayout>
    </SecondaryPageLayout>
  );
};

export default PasskeySetup;
