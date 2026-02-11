import { InteractionEvent, MfaFactor, type WebAuthnAuthenticationOptions } from '@logto/schemas';
import { browserSupportsWebAuthnAutofill } from '@simplewebauthn/browser';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import WebAuthnContext from '@/Providers/WebAuthnContextProvider/WebAuthnContext';
import { initInteraction, verifySignInWebAuthn } from '@/apis/experience';
import { isDevFeaturesEnabled } from '@/constants/env';
import { toPublicKeyRequest, toAuthenticationResponseJSON } from '@/utils/webauthn';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import { useSieMethods } from './use-sie';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';
import useToast from './use-toast';

const usePasskeyAutofillConditionalUI = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  const { authenticationOptions, abortConditionalUI, setConditionalUIAbortController } =
    useContext(WebAuthnContext);
  const { passkeySignIn } = useSieMethods();
  const asyncVerifySignInWebAuthn = useApi(verifySignInWebAuthn);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  const preSignInErrorHandlers = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  const triggerPasskeySignInViaConditionalUi = useCallback(
    async (options: WebAuthnAuthenticationOptions) => {
      if (!isDevFeaturesEnabled || !(await browserSupportsWebAuthnAutofill())) {
        return;
      }
      try {
        // Abort any previous conditional UI request before starting a new one
        abortConditionalUI();

        const abortController = new AbortController();
        setConditionalUIAbortController(abortController);

        window.setTimeout(() => {
          abortController.abort();
        }, 60_000);

        const credential = await navigator.credentials.get({
          mediation: 'conditional',
          signal: abortController.signal,
          publicKey: toPublicKeyRequest(options),
        });

        if (!(credential instanceof PublicKeyCredential)) {
          return;
        }

        await initInteraction(InteractionEvent.SignIn);

        const [error, result] = await asyncVerifySignInWebAuthn({
          ...toAuthenticationResponseJSON(credential),
          type: MfaFactor.WebAuthn,
        });

        if (error) {
          await handleError(error, preSignInErrorHandlers);
          return;
        }

        if (result) {
          await redirectTo(result.redirectTo);
        }
      } catch (error: unknown) {
        if (
          (error instanceof DOMException && error.name === 'AbortError') ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          return;
        }
        setToast(t('passkey_sign_in.trigger_conditional_ui_failed'));
      }
    },
    [
      asyncVerifySignInWebAuthn,
      handleError,
      preSignInErrorHandlers,
      redirectTo,
      setToast,
      t,
      abortConditionalUI,
      setConditionalUIAbortController,
    ]
  );

  useEffect(() => {
    if (
      isDevFeaturesEnabled &&
      authenticationOptions &&
      passkeySignIn?.enabled &&
      passkeySignIn.allowAutofill
    ) {
      void triggerPasskeySignInViaConditionalUi(authenticationOptions);
    }
  }, [
    authenticationOptions,
    passkeySignIn?.enabled,
    passkeySignIn?.allowAutofill,
    triggerPasskeySignInViaConditionalUi,
  ]);

  return useMemo(
    () => ({
      isPasskeyAutofillEnabled:
        isDevFeaturesEnabled && passkeySignIn?.enabled && passkeySignIn.allowAutofill,
      triggerPasskeySignInViaConditionalUi,
    }),
    [passkeySignIn?.enabled, passkeySignIn?.allowAutofill, triggerPasskeySignInViaConditionalUi]
  );
};

export default usePasskeyAutofillConditionalUI;
