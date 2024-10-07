import { useCallback } from 'react';

import { getSingleSignOnUrl } from '@/apis/single-sign-on';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { buildSocialLandingUri, generateState, storeState } from '@/utils/social-connectors';

import useGlobalRedirectTo from './use-global-redirect-to';

const useSingleSignOn = () => {
  const handleError = useErrorHandler();
  const asyncInvokeSingleSignOn = useApi(getSingleSignOnUrl);
  const redirectTo = useGlobalRedirectTo({
    shouldClearInteractionContextSession: false,
    isReplace: false,
  });

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

      const [error, redirectUrl] = await asyncInvokeSingleSignOn(
        connectorId,
        state,
        `${window.location.origin}/callback/${connectorId}`
      );

      if (error) {
        await handleError(error);

        return;
      }

      if (!redirectUrl) {
        return;
      }

      // Invoke Native Sign In flow
      if (isNativeWebview()) {
        nativeSignInHandler(redirectUrl, connectorId);
      }

      // Invoke Web Sign In flow
      await redirectTo(redirectUrl);
    },
    [asyncInvokeSingleSignOn, handleError, nativeSignInHandler, redirectTo]
  );
};

export default useSingleSignOn;
