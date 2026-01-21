import {
  InteractionEvent,
  MfaFactor,
  type WebAuthnAuthenticationOptions,
  type WebAuthnRegistrationOptions,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { bindSignInWebAuthn, initInteraction, verifySignInWebAuthn } from '@/apis/experience';

import useApi from './use-api';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useToast from './use-toast';

const usePasskeySignIn = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  const asyncBindSignInWebAuthn = useApi(bindSignInWebAuthn);
  const asyncVerifySignInWebAuthn = useApi(verifySignInWebAuthn);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  const handleBindPasskey = useCallback(
    async (
      options: WebAuthnRegistrationOptions,
      verificationId: string,
      errorHandlers: ErrorHandlers
    ) => {
      if (!browserSupportsWebAuthn()) {
        setToast(t('mfa.webauthn_not_supported'));
        return;
      }

      const response = await trySafe(
        async () => startRegistration(options),
        () => {
          setToast(t('mfa.webauthn_failed_to_create'));
        }
      );

      if (!response) {
        return;
      }

      const [error, result] = await asyncBindSignInWebAuthn(
        { ...response, type: MfaFactor.WebAuthn },
        verificationId
      );

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncBindSignInWebAuthn, handleError, redirectTo, setToast, t]
  );

  const handleVerifyPasskey = useCallback(
    async (options: WebAuthnAuthenticationOptions, errorHandlers: ErrorHandlers) => {
      if (!browserSupportsWebAuthn()) {
        setToast(t('mfa.webauthn_not_supported'));
        return;
      }
      const response = await trySafe(
        async () => startAuthentication(options),
        () => {
          setToast(t('mfa.webauthn_failed_to_verify'));
        }
      );

      if (!response) {
        return;
      }

      await initInteraction(InteractionEvent.SignIn);

      const [error, result] = await asyncVerifySignInWebAuthn({
        ...response,
        type: MfaFactor.WebAuthn,
      });

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncVerifySignInWebAuthn, handleError, redirectTo, setToast, t]
  );

  return useMemo(
    () => ({
      handleBindPasskey,
      handleVerifyPasskey,
    }),
    [handleBindPasskey, handleVerifyPasskey]
  );
};

export default usePasskeySignIn;
