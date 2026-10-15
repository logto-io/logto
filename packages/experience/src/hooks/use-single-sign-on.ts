import { InteractionEvent, VerificationType } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { getSsoAuthorizationUrl, initInteraction } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { searchKeys } from '@/shared/utils/search-parameters';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { buildSocialLandingUri, generateState, storeState } from '@/utils/social-connectors';
import { storeRedirectContext } from '@/utils/social-redirect-fallback-context';

import useGlobalRedirectTo from './use-global-redirect-to';
import useStepUpContext from './use-step-up-context';
import { usePureStepUpErrorHandler } from './use-step-up-error-handler';

const useSingleSignOn = () => {
  const handleError = useErrorHandler();
  const { isPureStepUp } = useStepUpContext();
  const stepUpErrorHandlers = usePureStepUpErrorHandler();
  const getAuthorizationUrl = useCallback(
    async (connectorId: string, payload: unknown) => {
      if (!isPureStepUp) {
        await initInteraction(InteractionEvent.SignIn);
      }

      return getSsoAuthorizationUrl(connectorId, payload);
    },
    [isPureStepUp]
  );
  const asyncInvokeSingleSignOn = useApi(getAuthorizationUrl);
  const redirectTo = useGlobalRedirectTo({
    shouldClearInteractionContextSession: false,
    isReplace: false,
  });
  const { setVerificationId } = useContext(UserInteractionContext);

  /**
   * Native IdP Sign In Flow
   * @param redirectTo - The redirect uri to redirect after the IdP Sign In flow (Need for OIDC Code Flow)
   *
   * @remarks In Native we need to open a new window to invoke the IdP Sign In flow (safariViewController in iOS and Custom Tabs in Android)
   * Forked from @see `hooks/user-social.ts`
   *
   */
  const nativeSignInHandler = useCallback((redirectTo: string, connectorId: string) => {
    const redirectUri = buildSocialLandingUri(
      `/social/landing/${connectorId}`,
      redirectTo
    ).toString();

    getLogtoNativeSdk()?.getPostMessage()({
      callbackUri: `${window.location.origin}/callback/social/${connectorId}`,
      redirectTo: redirectUri,
    });
  }, []);

  /**
   * Invoke Single Sign On flow
   * Get the Single Sign On url from the backend and redirect to it
   */
  return useCallback(
    async (connectorId: string) => {
      const state = generateState();
      storeState(state, connectorId);

      const [error, result] = await asyncInvokeSingleSignOn(connectorId, {
        state,
        redirectUri: `${window.location.origin}/callback/${connectorId}`,
      });

      if (error) {
        await handleError(error, stepUpErrorHandlers);

        return;
      }

      if (!result) {
        return;
      }

      const { authorizationUri, verificationId } = result;

      setVerificationId(VerificationType.EnterpriseSso, verificationId);

      // Write fallback bundle to localStorage for in-app browser session recovery
      storeRedirectContext({
        state,
        flow: 'sso',
        connectorId,
        verificationId,
        appId: sessionStorage.getItem(searchKeys.appId) ?? undefined,
        organizationId: sessionStorage.getItem(searchKeys.organizationId) ?? undefined,
        uiLocales: sessionStorage.getItem(searchKeys.uiLocales) ?? undefined,
      });

      // Invoke Native Sign In flow
      if (isNativeWebview()) {
        nativeSignInHandler(authorizationUri, connectorId);
      }

      // Invoke Web Sign In flow
      await redirectTo(authorizationUri);
    },
    [
      asyncInvokeSingleSignOn,
      handleError,
      nativeSignInHandler,
      redirectTo,
      setVerificationId,
      stepUpErrorHandlers,
    ]
  );
};

export default useSingleSignOn;
