import { useCallback, useContext } from 'react';

import { invokeSocialSignIn } from '@/apis/social';

import useApi from './use-api';
import useAppleAuth, { isAppleConnector } from './use-apple-auth';
import { PageContext } from './use-page-context';
import useTerms from './use-terms';
import { getLogtoNativeSdk, isNativeWebview, generateState, storeState } from './utils';

const useSocial = () => {
  const { experienceSettings } = useContext(PageContext);
  const { termsValidation } = useTerms();
  const appleAuth = useAppleAuth();

  const { run: asyncInvokeSocialSignIn } = useApi(invokeSocialSignIn);

  const invokeSocialSignInHandler = useCallback(
    async (connectorId: string, target: string, callback?: () => void) => {
      if (!(await termsValidation())) {
        return;
      }

      const state = generateState();
      storeState(state, connectorId);

      const { origin } = window.location;

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

      // For Sign In with Apple, use the official SDK directly
      if (isAppleConnector({ target })) {
        await appleAuth(connectorId, result.redirectTo);

        return;
      }

      // Invoke Native Social Sign In flow
      if (isNativeWebview()) {
        getLogtoNativeSdk()?.getPostMessage()({
          callbackUri: `${origin}/sign-in/callback/${connectorId}`,
          redirectTo: result.redirectTo,
        });

        return;
      }

      // Invoke Web Social Sign In flow
      window.location.assign(result.redirectTo);
    },
    [asyncInvokeSocialSignIn, termsValidation]
  );

  return {
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    invokeSocialSignIn: invokeSocialSignInHandler,
  };
};

export default useSocial;
