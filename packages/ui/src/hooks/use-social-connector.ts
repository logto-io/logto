import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { invokeSocialSignIn, signInWithSoical } from '@/apis/social';
import { generateRandomString } from '@/utils';

import useApi from './use-api';

const storageKeyPrefix = 'social_auth_state';
const webPlatformPrefix = 'web';
const mobilePlatformPrefix = 'mobile';

const isMobileWebview = () => {
  // TODO: read from native sdk embedded params
  return true;
};

const useSocial = () => {
  const { result: invokeSocialSignInResult, run: asyncSignInWithSocial } =
    useApi(invokeSocialSignIn);
  const { result: signInToSocialResult, run: asyncSignInWithSoical } = useApi(signInWithSoical);

  const { search } = useLocation();

  const validateState = useCallback((state: string, connectorId: string) => {
    if (state.startsWith(mobilePlatformPrefix)) {
      return true; // Not able to validate the state source from the native call stack
    }

    const stateStorage = sessionStorage.getItem(`${storageKeyPrefix}:${connectorId}`);

    return stateStorage === state;
  }, []);

  const signInWithSocialHandler = useCallback(
    (connector?: string) => {
      const uriParameters = new URLSearchParams(search);
      const state = uriParameters.get('state');
      const code = uriParameters.get('code');

      if (!state || !code || !connector) {
        // TODO: error message
        return;
      }

      if (!validateState(state, connector)) {
        // TODO: error message
        return;
      }

      void asyncSignInWithSoical({ connectorId: connector, state, code, redirectUri: 'TODO' });
    },
    [asyncSignInWithSoical, search, validateState]
  );

  const invokeSocialSignInHandler = useCallback(
    async (connectorId: string) => {
      const state = `${
        isMobileWebview() ? mobilePlatformPrefix : webPlatformPrefix
      }_${generateRandomString()}`;
      const { origin } = window.location;
      sessionStorage.setItem(`${storageKeyPrefix}:${connectorId}`, state);

      return asyncSignInWithSocial(connectorId, state, `${origin}/callback/${connectorId}`);
    },
    [asyncSignInWithSocial]
  );

  useEffect(() => {
    if (invokeSocialSignInResult?.redirectTo) {
      window.location.assign(invokeSocialSignInResult.redirectTo);
    }
  }, [invokeSocialSignInResult]);

  useEffect(() => {
    if (signInToSocialResult?.redirectTo) {
      window.location.assign(signInToSocialResult.redirectTo);
    }
  }, [signInToSocialResult]);

  return {
    invokeSocialSignIn: invokeSocialSignInHandler,
    signInWithSocial: signInWithSocialHandler,
  };
};

export default useSocial;
