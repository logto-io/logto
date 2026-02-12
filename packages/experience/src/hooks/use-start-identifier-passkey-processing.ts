import { type SignInIdentifier, VerificationType } from '@logto/schemas';
import { useCallback, useContext, useMemo, useState } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { createIdentifierPasskeyAuthentication } from '@/apis/experience';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { UserFlow } from '@/types';
import type { IdentifierPasskeyState } from '@/types/guard';

import useApi from './use-api';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';

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
const useStartIdentifierPasskeyProcessing = () => {
  const navigate = useNavigateWithPreservedSearchParams();
  const asyncCreateAuthentication = useApi(createIdentifierPasskeyAuthentication);
  const { setVerificationId } = useContext(UserInteractionContext);
  const [isLoading, setIsLoading] = useState(false);
  const handleError = useErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.mfa.webauthn_verification_not_found': async () => {
        // No passkeys registered - Do nothing and silently fall back to other methods
      },
    }),
    []
  );

  /**
   * @returns `true` if passkey flow was started, `false` if user has no passkeys
   * (caller should fall back to other verification methods)
   */
  return useCallback(
    async (identifier: { type: SignInIdentifier; value: string }): Promise<boolean> => {
      if (isLoading) {
        return false;
      }

      setIsLoading(true);
      const [error, result] = await asyncCreateAuthentication(identifier);
      setIsLoading(false);

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
    [asyncCreateAuthentication, errorHandlers, handleError, isLoading, navigate, setVerificationId]
  );
};

export default useStartIdentifierPasskeyProcessing;
