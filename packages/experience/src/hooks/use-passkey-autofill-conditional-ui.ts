import { InteractionEvent, MfaFactor, type WebAuthnAuthenticationOptions } from '@logto/schemas';
import { browserSupportsWebAuthnAutofill } from '@simplewebauthn/browser';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
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
  const { authenticationOptions } = useContext(WebAuthnContext);
  const { passkeySignIn } = useSieMethods();
  const asyncVerifySignInWebAuthn = useApi(verifySignInWebAuthn);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  const preSignInErrorHandlers = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });
  const passkeyAutofillAbortControllerRef = useRef<AbortController>();

  const triggerPasskeySignInViaConditionalUi = useCallback(
    async (options: WebAuthnAuthenticationOptions) => {
      if (!isDevFeaturesEnabled || !(await browserSupportsWebAuthnAutofill())) {
        return;
      }
      try {
        if (passkeyAutofillAbortControllerRef.current) {
          passkeyAutofillAbortControllerRef.current.abort();
        }
        // eslint-disable-next-line @silverhand/fp/no-mutation
        passkeyAutofillAbortControllerRef.current = new AbortController();
        window.setTimeout(() => {
          passkeyAutofillAbortControllerRef.current?.abort();
        }, 60_000);

        const credential = await navigator.credentials.get({
          mediation: 'conditional',
          signal: passkeyAutofillAbortControllerRef.current.signal,
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
        // TODO: @charles Remove later
        console.error(error);
        setToast(t('passkey_sign_in.trigger_conditional_ui_failed'));
      }
    },
    [asyncVerifySignInWebAuthn, handleError, preSignInErrorHandlers, redirectTo, setToast, t]
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
