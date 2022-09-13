import { ConnectorMetadata } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import { invokeSocialSignIn } from '@/apis/social';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { generateState, storeState, buildSocialLandingUri } from '@/utils/social-connectors';

import useApi from './use-api';
import { PageContext } from './use-page-context';
import useTerms from './use-terms';

const useSocial = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const { termsValidation } = useTerms();

  const { run: asyncInvokeSocialSignIn } = useApi(invokeSocialSignIn);

  const nativeSignInHandler = useCallback((redirectTo: string, connector: ConnectorMetadata) => {
    const { id: connectorId, platform } = connector;

    const redirectUri =
      platform === 'Universal'
        ? buildSocialLandingUri(`/social/landing/${connectorId}`, redirectTo).toString()
        : redirectTo;

    getLogtoNativeSdk()?.getPostMessage()({
      callbackUri: `${window.location.origin}/social/sign-in-callback/${connectorId}`,
      redirectTo: redirectUri,
    });
  }, []);

  const invokeSocialSignInHandler = useCallback(
    async (connector: ConnectorMetadata) => {
      if (!(await termsValidation())) {
        return;
      }

      const { id: connectorId } = connector;

      const state = generateState();
      storeState(state, connectorId);

      const result = await asyncInvokeSocialSignIn(
        connectorId,
        state,
        `${window.location.origin}/callback/${connectorId}`
      );

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
    [asyncInvokeSocialSignIn, nativeSignInHandler, termsValidation]
  );

  return {
    theme,
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    invokeSocialSignIn: invokeSocialSignInHandler,
  };
};

export default useSocial;
