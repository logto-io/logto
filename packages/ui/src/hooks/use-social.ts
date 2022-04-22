import { useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { invokeSocialSignIn, signInWithSocial } from '@/apis/social';
import { generateRandomString, parseQueryParameters } from '@/utils';

import useApi from './use-api';
import { PageContext } from './use-page-context';
import useTerms from './use-terms';

/**
 * Social Connector State Utility Methods
 * @param state
 * @param state.uuid - unique id
 * @param state.platform - platform
 * @param state.callbackLink - callback uri scheme
 */

type State = {
  uuid: string;
  platform: 'web' | 'ios' | 'android';
  callbackLink?: string;
};

const storageKeyPrefix = 'social_auth_state';

const getLogtoNativeSdk = () => {
  if (typeof logtoNativeSdk !== 'undefined') {
    return logtoNativeSdk;
  }
};

export const generateState = () => {
  const uuid = generateRandomString();
  const platform = getLogtoNativeSdk()?.platform ?? 'web';
  const callbackLink = getLogtoNativeSdk()?.callbackLink;

  const state: State = { uuid, platform, callbackLink };

  return btoa(JSON.stringify(state));
};

export const decodeState = (state: string) => {
  try {
    return JSON.parse(atob(state)) as State;
  } catch {}
};

export const stateValidation = (state: string, connectorId: string) => {
  const stateStorage = sessionStorage.getItem(`${storageKeyPrefix}:${connectorId}`);

  return stateStorage === state;
};

export const storeState = (state: string, connectorId: string) => {
  sessionStorage.setItem(`${storageKeyPrefix}:${connectorId}`, state);
};

/* ============================================================================ */

const isNativeWebview = () => {
  const platform = getLogtoNativeSdk()?.platform ?? '';

  return ['ios', 'android'].includes(platform);
};

const useSocial = () => {
  const { setToast } = useContext(PageContext);
  const { termsValidation } = useTerms();
  const parameters = useParams();

  const { result: invokeSocialSignInResult, run: asyncInvokeSocialSignIn } =
    useApi(invokeSocialSignIn);

  const { result: signInWithSocialResult, run: asyncSignInWithSocial } = useApi(signInWithSocial);

  const invokeSocialSignInHandler = useCallback(
    async (connectorId: string) => {
      if (!termsValidation()) {
        return;
      }

      const state = generateState();
      storeState(state, connectorId);

      const { origin } = window.location;

      return asyncInvokeSocialSignIn(connectorId, state, `${origin}/callback/${connectorId}`);
    },
    [asyncInvokeSocialSignIn, termsValidation]
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

      const { platform, callbackLink } = decodedState;

      if (platform === 'web') {
        window.location.assign(
          new URL(`${location.origin}/sign-in/callback/${connectorId}/${window.location.search}`)
        );

        return;
      }

      if (!callbackLink) {
        // TODO: native callbackLink not found error message
        return;
      }

      window.location.assign(new URL(`${callbackLink}${window.location.search}`));
    },
    [setToast]
  );

  // InvokeSocialSignIn Callback
  useEffect(() => {
    const { redirectTo } = invokeSocialSignInResult ?? {};

    if (!redirectTo) {
      return;
    }

    // Invoke Native Social Sign In flow
    if (isNativeWebview()) {
      getLogtoNativeSdk()?.getPostMessage()({
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

  // Social Sign-In Callback Handler
  useEffect(() => {
    if (!location.pathname.includes('/sign-in/callback') || !parameters.connector) {
      return;
    }

    const { state, code } = parseQueryParameters(window.location.search);

    if (!state || !code) {
      return;
    }

    signInWithSocialHandler(parameters.connector, state, code);
  }, [parameters.connector, signInWithSocialHandler]);

  // Monitor Native Error Message
  useEffect(() => {
    const nativeMessageHandler = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        setToast(JSON.stringify(event.data));
      }
    };

    window.addEventListener('message', nativeMessageHandler);

    return () => {
      window.removeEventListener('message', nativeMessageHandler);
    };
  }, [setToast]);

  return {
    invokeSocialSignIn: invokeSocialSignInHandler,
    socialCallbackHandler,
  };
};

export default useSocial;
