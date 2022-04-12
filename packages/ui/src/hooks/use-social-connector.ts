import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { signInWithSocial, signInToSoical } from '@/apis/social';
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
  const { result: signInWithSocialResult, run: asyncSignInWithSocial } = useApi(signInWithSocial);
  const { result: signInToSocialResult, run: asyncSignInToSoical } = useApi(signInToSoical);

  const { search } = useLocation();

  const validateState = useCallback((state: string, connectorId: string) => {
    if (state.startsWith(mobilePlatformPrefix)) {
      return true; // Not able to validate the state source from the native call stack
    }

    const stateStorage = sessionStorage.getItem(`${storageKeyPrefix}:${connectorId}`);

    return stateStorage === state;
  }, []);

  const socialCallbackHandler = useCallback(
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

      void asyncSignInToSoical({ connectorId: connector, state, code, redirectUri: 'TODO' });
    },
    [asyncSignInToSoical, search, validateState]
  );

  const signInWithSocialHandler = useCallback(
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
    if (signInWithSocialResult?.redirectTo) {
      window.location.assign(signInWithSocialResult.redirectTo);
    }
  }, [signInWithSocialResult]);

  useEffect(() => {
    if (signInToSocialResult?.redirectTo) {
      window.location.assign(signInToSocialResult.redirectTo);
    }
  }, [signInToSocialResult]);

  return {
    signInWithSocial: signInWithSocialHandler,
    socialCallbackHandler,
  };
};

export default useSocial;
