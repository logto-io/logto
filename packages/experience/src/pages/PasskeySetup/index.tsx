import { InteractionEvent, type WebAuthnRegistrationOptions } from '@logto/schemas';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SectionLayout from '@/Layout/SectionLayout';
import { createSignInWebAuthnRegistrationOptions } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import usePasskeySignIn from '@/hooks/use-passkey-sign-in';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';
import { continueFlowStateGuard } from '@/types/guard';

import styles from './index.module.scss';

type RegistrationState = {
  verificationId: string;
  options: WebAuthnRegistrationOptions;
};

const PasskeySetup = () => {
  const { state } = useLocation();
  const [, continueFlowState] = validate(state, continueFlowStateGuard);

  const { handleBindPasskey } = usePasskeySignIn();
  const asyncCreateRegistrationOptions = useApi(createSignInWebAuthnRegistrationOptions);

  const [registrationResult, setRegistrationResult] = useState<RegistrationState>();
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleError = useErrorHandler();
  const onSubmitErrorHandlers = useSubmitInteractionErrorHandler(
    continueFlowState?.interactionEvent ?? InteractionEvent.SignIn,
    {
      replace: true,
    }
  );

  useEffect(() => {
    if (!browserSupportsWebAuthn()) {
      return;
    }

    (async () => {
      setIsPreparing(true);
      const [error, result] = await asyncCreateRegistrationOptions();
      setIsPreparing(false);

      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        setRegistrationResult(result);
      }
    })();
  }, [asyncCreateRegistrationOptions, handleError]);

  const onCreatePasskey = useCallback(async () => {
    if (!registrationResult) {
      return;
    }

    setIsSubmitting(true);
    await handleBindPasskey(
      registrationResult.options,
      registrationResult.verificationId,
      onSubmitErrorHandlers
    );
    setIsSubmitting(false);
  }, [handleBindPasskey, registrationResult, onSubmitErrorHandlers]);

  const onSkip = useCallback(() => {
    // TODO: Skip adding passkey for sign-in and redirect to the next step
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
