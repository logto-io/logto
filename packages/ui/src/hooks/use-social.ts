import { useCallback, useContext, useMemo } from 'react';

import { invokeSocialSignIn } from '@/apis/social';

import useApi from './use-api';
import { PageContext } from './use-page-context';
import useTerms from './use-terms';
import {
  getLogtoNativeSdk,
  isNativeWebview,
  generateState,
  storeState,
  buildSocialLandingUri,
} from './utils';

const useSocial = () => {
  const { experienceSettings } = useContext(PageContext);
  const { termsValidation } = useTerms();

  const socialConnectors = useMemo(
    () => experienceSettings?.socialConnectors ?? [],
    [experienceSettings]
  );

  const { origin } = window.location;

  const { run: asyncInvokeSocialSignIn } = useApi(invokeSocialSignIn);

  const nativeSignInHandler = useCallback(
    (redirectTo: string, connectorId: string) => {
      const connector = socialConnectors.find(({ id }) => id === connectorId);

      const redirectUri =
        connector?.platform === 'Universal'
          ? buildSocialLandingUri(`/social-landing/${connectorId}`, redirectTo).toString()
          : redirectTo;

      getLogtoNativeSdk()?.getPostMessage()({
        callbackUri: `${origin}/sign-in/callback/${connectorId}`,
        redirectTo: redirectUri,
      });
    },
    [origin, socialConnectors]
  );

  const invokeSocialSignInHandler = useCallback(
    async (connectorId: string, target: string, callback?: () => void) => {
      if (!(await termsValidation())) {
        return;
      }

      const state = generateState();
      storeState(state, connectorId);

      const result = await asyncInvokeSocialSignIn(
        connectorId,
        state,
        `${origin}/callback/${connectorId}`
      );

      if (!result?.redirectTo) {
        return;
      }

      // Callback hook to close the social sign in modal
      callback?.();

      // Invoke Native Social Sign In flow
      if (isNativeWebview()) {
        nativeSignInHandler(result.redirectTo, connectorId);

        return;
      }

      // Invoke Web Social Sign In flow
      window.location.assign(result.redirectTo);
    },
    [asyncInvokeSocialSignIn, nativeSignInHandler, origin, termsValidation]
  );

  return {
    socialConnectors,
    invokeSocialSignIn: invokeSocialSignInHandler,
  };
};

export default useSocial;
