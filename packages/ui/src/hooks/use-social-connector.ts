import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { signInWithSocial, signInToSoical } from '@/apis/social';
import { generateRandomString } from '@/utils';

import useApi from './use-api';

const StorageKeyPrefix = 'social_auth_state';
const WebPlatformPrefix = 'web';
const MobilePlatformPrefix = 'mobile';

const isMobileWebview = () => {
  // TODO: read from native sdk imbeded params
  return true;
};

const useSocial = () => {
  const { result: signInWithSocialResult, run: asyncSignInWithSocial } = useApi(signInWithSocial);
  const { result: signInToSoicalResult, run: asyncSignInToSoical } = useApi(signInToSoical);

  const { search } = useLocation();

  const stateValidation = useCallback((state: string, connectorId: string) => {
    if (state.startsWith(MobilePlatformPrefix)) {
      return true; // Not able to validate the state source from the native call stack
    }

    const stateStorage = sessionStorage.getItem(`${StorageKeyPrefix}:${connectorId}`);

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

      if (!stateValidation(state, connector)) {
        // TODO: error message
        return;
      }

      void asyncSignInToSoical({ connectorId: connector, state, code, redirectUri: 'TODO' });
    },
    [asyncSignInToSoical, search, stateValidation]
  );

  const signInWithSocialHandler = useCallback(
    async (connectorId: string) => {
      const state = `${
        isMobileWebview() ? MobilePlatformPrefix : WebPlatformPrefix
      }_${generateRandomString()}`;
      const { origin } = window.location;
      sessionStorage.setItem(`${StorageKeyPrefix}:${connectorId}`, state);

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
    if (signInToSoicalResult?.redirectTo) {
      window.location.assign(signInToSoicalResult.redirectTo);
    }
  }, [signInToSoicalResult]);

  return {
    signInWithSocial: signInWithSocialHandler,
    socialCallbackHandler,
  };
};

export default useSocial;
