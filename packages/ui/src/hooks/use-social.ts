import { useEffect, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import { invokeSocialSignIn, signInWithSocial } from '@/apis/social';
import { parseQueryParameters } from '@/utils';

import useApi, { ErrorHandlers } from './use-api';
import { PageContext } from './use-page-context';
import useTerms from './use-terms';
import {
  getLogtoNativeSdk,
  isNativeWebview,
  generateState,
  decodeState,
  stateValidation,
  storeState,
} from './utils';

const useSocial = () => {
  const { setToast, experienceSettings } = useContext(PageContext);
  const { termsValidation } = useTerms();
  const parameters = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const signInWithSocialErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.identity_not_exists': (error) => {
        if (parameters.connector) {
          navigate(`/social-register/${parameters.connector}`, {
            state: {
              ...(error.data as Record<string, unknown> | undefined),
            },
          });
        }
      },
    }),
    [navigate, parameters.connector]
  );

  const { run: asyncInvokeSocialSignIn } = useApi(invokeSocialSignIn);

  const { run: asyncSignInWithSocial } = useApi(signInWithSocial, signInWithSocialErrorHandlers);

  const invokeSocialSignInHandler = useCallback(
    async (connectorId: string, callback?: () => void) => {
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

      // Invoke Native Social Sign In flow
      if (isNativeWebview()) {
        getLogtoNativeSdk()?.getPostMessage()({
          callbackUri: `${origin}/callback/${connectorId}`,
          redirectTo: result.redirectTo,
        });

        return;
      }

      // Invoke Web Social Sign In flow
      window.location.assign(result.redirectTo);
    },
    [asyncInvokeSocialSignIn, termsValidation]
  );

  const signInWithSocialHandler = useCallback(
    async (connectorId: string, state: string, code: string) => {
      if (!stateValidation(state, connectorId)) {
        setToast(t('error.invalid_connector_auth'));

        return;
      }

      const result = await asyncSignInWithSocial({
        connectorId,
        code,
        redirectUri: `${origin}/callback/${connectorId}`,
      });

      if (result?.redirectTo) {
        window.location.assign(result.redirectTo);
      }
    },
    [asyncSignInWithSocial, setToast, t]
  );

  const socialCallbackHandler = useCallback(() => {
    const { state, code, error, error_description } = parseQueryParameters(window.location.search);
    const connectorId = parameters.connector;

    if (error) {
      setToast(`${error}${error_description ? `: ${error_description}` : ''}`);
    }

    if (!state || !code || !connectorId) {
      setToast(t('error.missing_auth_data'));

      return;
    }

    const decodedState = decodeState(state);

    if (!decodedState) {
      setToast(t('error.missing_auth_data'));

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
      // CallbackLink should not empty for native webview
      throw new Error('CallbackLink is empty');
    }

    window.location.assign(new URL(`${callbackLink}${window.location.search}`));
  }, [parameters.connector, setToast, t]);

  // Social Sign-In Callback Handler
  useEffect(() => {
    if (!location.pathname.includes('/sign-in/callback') || !parameters.connector) {
      return;
    }

    const { state, code } = parseQueryParameters(window.location.search);

    if (!state || !code) {
      return;
    }

    void signInWithSocialHandler(parameters.connector, state, code);
  }, [parameters.connector, signInWithSocialHandler]);

  // Monitor Native Error Message
  useEffect(() => {
    if (!isNativeWebview()) {
      return;
    }

    const nativeMessageHandler = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        try {
          setToast(JSON.stringify(event.data));
        } catch {}
      }
    };

    window.addEventListener('message', nativeMessageHandler);

    return () => {
      window.removeEventListener('message', nativeMessageHandler);
    };
  }, [setToast]);

  return {
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    invokeSocialSignIn: invokeSocialSignInHandler,
    socialCallbackHandler,
  };
};

export default useSocial;
