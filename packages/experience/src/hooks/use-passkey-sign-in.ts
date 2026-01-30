import {
  InteractionEvent,
  MfaFactor,
  type WebAuthnAuthenticationOptions,
  type WebAuthnRegistrationOptions,
} from '@logto/schemas';
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { bindPasskeyForSignIn, verifyPasskeyForSignIn } from '@/apis/experience';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';
import useToast from './use-toast';

const usePasskeySignIn = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  const asyncBindPasskey = useApi(bindPasskeyForSignIn);
  const asyncVerifyPasskey = useApi(verifyPasskeyForSignIn);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });
  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register, {
    replace: true,
  });

  const registerPasskeyForSignIn = useCallback(
    async (options: WebAuthnRegistrationOptions, verificationId: string) => {
      if (!browserSupportsWebAuthn()) {
        setToast(t('mfa.webauthn_not_supported'));
        return;
      }

      const response = await startRegistration(options);

      const [error, result] = await asyncBindPasskey(
        { ...response, type: MfaFactor.WebAuthn },
        verificationId
      );

      if (error) {
        await handleError(error, preRegisterErrorHandler);
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncBindPasskey, handleError, preRegisterErrorHandler, redirectTo, setToast, t]
  );

  const verifyPasskeyForSignin = useCallback(
    async (options: WebAuthnAuthenticationOptions) => {
      if (!browserSupportsWebAuthn()) {
        setToast(t('mfa.webauthn_not_supported'));
        return;
      }
      const response = await startAuthentication(options);

      const [error, result] = await asyncVerifyPasskey({ ...response, type: MfaFactor.WebAuthn });

      if (error) {
        await handleError(error, preSignInErrorHandler);
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncVerifyPasskey, handleError, preSignInErrorHandler, redirectTo, setToast, t]
  );

  return useMemo(
    () => ({
      registerPasskeyForSignIn,
      verifyPasskeyForSignin,
    }),
    [registerPasskeyForSignIn, verifyPasskeyForSignin]
  );
};

export default usePasskeySignIn;
