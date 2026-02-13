import { type SignInIdentifier, VerificationType } from '@logto/schemas';
import { useCallback, useContext, useMemo, useState } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import WebAuthnContext from '@/Providers/WebAuthnContextProvider/WebAuthnContext';
import { createIdentifierPasskeyAuthentication } from '@/apis/experience';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { UserFlow } from '@/types';
import type { IdentifierPasskeyState } from '@/types/guard';

import useApi from './use-api';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';
import useToast from './use-toast';

type Props = {
  readonly toastError?: boolean;
};

/**
 * Hook to start identifier-based passkey verification flow.
 *
 * When the user has entered an identifier and passkey sign-in is enabled,
 * this hook fetches the WebAuthn authentication options for that user
 * and navigates to the passkey verification page.
 *
 * Returns `true` if the passkey flow was initiated successfully, `false` if
 * the user has no passkeys registered (so caller can fall back to other methods).
 *
 * Only passes WebAuthn options in navigation state. Identifier and available
 * methods are read from UserInteractionContext and useSieMethods() by the target page.
 */
const useStartIdentifierPasskeySignInProcessing = (props?: Props) => {
  const { setToast } = useToast();
  const navigate = useNavigateWithPreservedSearchParams();
  const asyncCreateAuthentication = useApi(createIdentifierPasskeyAuthentication);
  const { setVerificationId } = useContext(UserInteractionContext);
  const { abortConditionalUI } = useContext(WebAuthnContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleError = useErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.mfa.webauthn_verification_not_found': async (error) => {
        // No passkeys registered
        if (props?.toastError) {
          setToast(error.message);
        }
        // Do nothing and silently fall back to other methods if toastError is false
      },
    }),
    [setToast, props?.toastError]
  );

  /**
   * @returns
   * `true` if passkey flow was started
   * `false` if user has no passkeys (caller should fall back to other verification methods)
   * `undefined` if already processing
   */
  const startProcessing = useCallback(
    async (identifier: { type: SignInIdentifier; value: string }): Promise<boolean | undefined> => {
      if (isProcessing) {
        return undefined;
      }

      // Abort any ongoing conditional UI (e.g. passkey autofill prompt) in the previous step.
      abortConditionalUI();

      setIsProcessing(true);
      const [error, result] = await asyncCreateAuthentication(identifier);
      setIsProcessing(false);

      // If user has no passkeys registered, return false so caller can fall back
      // to other verification methods (password, verification code)
      if (error) {
        await handleError(error, errorHandlers);
        return false;
      }

      if (result) {
        const { verificationId, options } = result;
        setVerificationId(VerificationType.SignInWebAuthn, verificationId);

        const state: IdentifierPasskeyState = { options };

        navigate({ pathname: `/${UserFlow.SignIn}/passkey` }, { state });
        return true;
      }
      return false;
    },
    [
      abortConditionalUI,
      asyncCreateAuthentication,
      errorHandlers,
      handleError,
      isProcessing,
      navigate,
      setVerificationId,
    ]
  );

  return useMemo(
    () => ({
      startProcessing,
      isProcessing,
    }),
    [startProcessing, isProcessing]
  );
};

export default useStartIdentifierPasskeySignInProcessing;
