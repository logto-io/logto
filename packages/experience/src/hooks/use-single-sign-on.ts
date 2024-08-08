import { VerificationType } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { getSsoAuthorizationUrl } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { buildSocialLandingUri, generateState, storeState } from '@/utils/social-connectors';

import useGlobalRedirectTo from './use-global-redirect-to';

const useSingleSignOn = () => {
  const handleError = useErrorHandler();
  const asyncInvokeSingleSignOn = useApi(getSsoAuthorizationUrl);
  const redirectTo = useGlobalRedirectTo({
    shouldClearInteractionContextSession: false,
    isReplace: false,
  });
  const { setVerificationId } = useContext(UserInteractionContext);

  /**
   * Native IdP Sign In Flow
   * @param redirectTo - The redirect uri to redirect after the IdP Sign In flow (Need for OIDC Code Flow)
   *
   * @remarks In Native we need to open a new window to invoke the IdP Sign In flow (safariViewController in iOS and Custom Tabs in Android)
   * Forked from @see `hooks/user-social.ts`
   *
   */
  const nativeSignInHandler = useCallback((redirectTo: string, connectorId: string) => {
    const redirectUri = buildSocialLandingUri(
      `/social/landing/${connectorId}`,
      redirectTo
    ).toString();

    getLogtoNativeSdk()?.getPostMessage()({
      callbackUri: `${window.location.origin}/callback/social/${connectorId}`,
      redirectTo: redirectUri,
    });
  }, []);

  /**
   * Invoke Single Sign On flow
   * Get the Single Sign On url from the backend and redirect to it
   */
  return useCallback(
    async (connectorId: string) => {
      const state = generateState();
      storeState(state, connectorId);

      const [error, result] = await asyncInvokeSingleSignOn(connectorId, {
        state,
        redirectUri: `${window.location.origin}/callback/${connectorId}`,
      });

      if (error) {
        await handleError(error);

        return;
      }

      if (!result) {
        return;
      }

      const { authorizationUri, verificationId } = result;

      setVerificationId(VerificationType.EnterpriseSso, verificationId);

      // Invoke Native Sign In flow
      if (isNativeWebview()) {
        nativeSignInHandler(authorizationUri, connectorId);
      }

      // Invoke Web Sign In flow
      await redirectTo(authorizationUri);
    },
    [asyncInvokeSingleSignOn, handleError, nativeSignInHandler, redirectTo, setVerificationId]
  );
};

export default useSingleSignOn;
