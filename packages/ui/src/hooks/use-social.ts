import { useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { invokeSocialSignIn, signInWithSocial } from '@/apis/social';
import { generateRandomString, parseQueryParameters } from '@/utils';

import PageContext from './page-context';
import useApi from './use-api';

/**
 * Social Connector State Utility Methods
 * @param state
 * @param state.uunid - unique id
 * @param state.platform - platform
 * @param state.callbackUriScheme - callback uri scheme
 */

type State = {
  uunid: string;
  platform: 'web' | 'ios' | 'android';
  callbackUriScheme?: string;
};

const storageKeyPrefix = 'social_auth_state';

export const generateState = () => {
  const uunid = generateRandomString();
  const platform = logtoNativeSdk?.platform ?? 'web';
  const callbackUriScheme = logtoNativeSdk?.callbackUriScheme;

  const state: State = { uunid, platform, callbackUriScheme };

  return Buffer.from(JSON.stringify(state)).toString('base64');
};

export const decodeState = (state: string) => {
  try {
    const value = JSON.parse(Buffer.from(state, 'base64').toString()) as State;

    return value;
  } catch {}
};

export const stateValidation = (state: string, connectorId: string) => {
  const stateStorage = sessionStorage.getItem(`${storageKeyPrefix}:${connectorId}`);

  return Boolean(stateStorage) && stateStorage === state;
};

export const storeState = (state: string, connectorId: string) => {
  sessionStorage.setItem(`${storageKeyPrefix}:${connectorId}`, state);
};

/* ============================================================================ */

const isNativeWebview = () => {
  return ['ios', 'android'].includes(logtoNativeSdk?.platform ?? '');
};

const useSocial = () => {
  const { setToast } = useContext(PageContext);
  const parameters = useParams();

  const { result: invokeSocialSignInResult, run: asyncInvokeSocialSignIn } =
    useApi(invokeSocialSignIn);

  const { result: signInWithSocialResult, run: asyncSignInWithSocial } = useApi(signInWithSocial);

  const invokeSocialSignInHandler = useCallback(
    async (connectorId: string) => {
      const state = generateState();
      storeState(state, connectorId);

      const { origin } = window.location;

      return asyncInvokeSocialSignIn(connectorId, state, `${origin}/callback/${connectorId}`);
    },
    [asyncInvokeSocialSignIn]
  );

  const signInWithSocialHandler = useCallback(
    (connectorId: string, state: string, code: string) => {
      if (!stateValidation(state, connectorId)) {
        // TODO: Invalid state error message
        return;
      }
      void asyncSignInWithSocial({ connectorId, state, code, redirectUri: '' });
    },
    [asyncSignInWithSocial]
  );

  const socialCallbackHandler = useCallback(
    (connectorId?: string) => {
      const { state, code, error, error_description } = parseQueryParameters(
        window.location.search
      );

      if (error) {
        setToast(`${error}${error_description ? `: ${error_description}` : ''}`);
      }

      if (!state || !code || !connectorId) {
        // TODO: error message
        return;
      }

      const decodedState = decodeState(state);

      if (!decodedState) {
        // TODO: invalid state error message
        return;
      }

      const { platform, callbackUriScheme } = decodedState;

      if (platform === 'web') {
        signInWithSocialHandler(connectorId, state, code);

        return;
      }

      if (!callbackUriScheme) {
        // TODO: native callbackUriScheme not found error message
        return;
      }

      window.location.assign(`${callbackUriScheme}${connectorId}${window.location.search}`);
    },
    [setToast, signInWithSocialHandler]
  );

  // InvokeSocialSignIn Callback
  useEffect(() => {
    const { redirectTo } = invokeSocialSignInResult ?? {};

    if (!redirectTo) {
      return;
    }

    // Invoke Native Social Sign In flow
    if (logtoNativeSdk && isNativeWebview()) {
      const postMessage = logtoNativeSdk.getPostMessage();
      postMessage({
        callbackUri: redirectTo.replace('/callback', '/sign-in/callback'),
        redirectTo,
      });

      return;
    }

    // Invoke Web Social Sign In flow
    window.location.assign(redirectTo);
  }, [invokeSocialSignInResult]);

  // SignInWithSocial Callback
  useEffect(() => {
    if (signInWithSocialResult?.redirectTo) {
      window.location.assign(signInWithSocialResult.redirectTo);
    }
  }, [signInWithSocialResult]);

  // SocialSignIn Callback Handler
  useEffect(() => {
    if (parameters.connector && location.pathname.includes('/callback')) {
      socialCallbackHandler(parameters.connector);
    }
  }, [parameters.connector, socialCallbackHandler]);

  // Monitor Native Error Message
  useEffect(() => {
    window.addEventListener('message', function (event) {
      if (event.origin === window.location.origin) {
        setToast(JSON.stringify(event.data));
      }
    });
  }, [setToast]);

  return {
    invokeSocialSignIn: invokeSocialSignInHandler,
    socialCallbackHandler,
  };
};

export default useSocial;
