import type { ConnectorMetadata } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import { getSocialAuthorizationUrl } from '@/apis/interaction';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { generateState, storeState, buildSocialLandingUri } from '@/utils/social-connectors';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import { PageContext } from './use-page-context';

const useSocial = () => {
  const { experienceSettings, theme } = useContext(PageContext);

  const handleError = useErrorHandler();
  const asyncInvokeSocialSignIn = useApi(getSocialAuthorizationUrl);

  const nativeSignInHandler = useCallback((redirectTo: string, connector: ConnectorMetadata) => {
    const { id: connectorId, platform } = connector;

    const redirectUri =
      platform === 'Universal'
        ? buildSocialLandingUri(`/social/landing/${connectorId}`, redirectTo).toString()
        : redirectTo;

    getLogtoNativeSdk()?.getPostMessage()({
      callbackUri: `${window.location.origin}/sign-in/social/${connectorId}`,
      redirectTo: redirectUri,
    });
  }, []);

  const invokeSocialSignInHandler = useCallback(
    async (connector: ConnectorMetadata) => {
      const { id: connectorId } = connector;

      const state = generateState();
      storeState(state, connectorId);

      const [error, result] = await asyncInvokeSocialSignIn(
        connectorId,
        state,
        `${window.location.origin}/callback/${connectorId}`
      );

      if (error) {
        await handleError(error);

        return;
      }

      if (!result?.redirectTo) {
        return;
      }

      // Invoke Native Social Sign In flow
      if (isNativeWebview()) {
        nativeSignInHandler(result.redirectTo, connector);

        return;
      }

      // Invoke Web Social Sign In flow
      window.location.assign(result.redirectTo);
    },
    [asyncInvokeSocialSignIn, handleError, nativeSignInHandler]
  );

  return {
    theme,
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    invokeSocialSignIn: invokeSocialSignInHandler,
  };
};

export default useSocial;
