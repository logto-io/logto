import { InteractionEvent, MfaFactor, type WebAuthnAuthenticationOptions } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { verifyIdentifierPasskey } from '@/apis/experience';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';
import useToast from './use-toast';

/**
 * Hook to handle WebAuthn authentication for identifier-based passkey sign-in.
 *
 * This is different from the MFA WebAuthn hook (useWebAuthnOperation) because:
 * - It calls the identifier-passkey-specific verify endpoint
 * - The verify endpoint also handles identification and interaction submission
 * - There is no MFA binding flow here, only authentication
 */
const useIdentifierPasskeySignInVerification = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  const asyncVerifyIdentifierPasskey = useApi(verifyIdentifierPasskey);
  const handleError = useErrorHandler();
  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn);
  const redirectTo = useGlobalRedirectTo();

  return useCallback(
    async (options: WebAuthnAuthenticationOptions, verificationId: string) => {
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

      const [error, result] = await asyncVerifyIdentifierPasskey(verificationId, {
        ...response,
        type: MfaFactor.WebAuthn,
      });

      if (error) {
        await handleError(error, preSignInErrorHandler);
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncVerifyIdentifierPasskey, handleError, preSignInErrorHandler, redirectTo, setToast, t]
  );
};

export default useIdentifierPasskeySignInVerification;
