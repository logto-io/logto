import {
  AgreeToTermsPolicy,
  ConnectorPlatform,
  InteractionEvent,
  VerificationType,
  type ExperienceSocialConnector,
} from '@logto/schemas';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { getSocialAuthorizationUrl, initInteraction } from '@/apis/experience';
import useAbortDirectSignIn from '@/hooks/use-abort-direct-sign-in';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useStepUpContext from '@/hooks/use-step-up-context';
import { usePureStepUpErrorHandler } from '@/hooks/use-step-up-error-handler';
import useTerms from '@/hooks/use-terms';
import { searchKeys } from '@/shared/utils/search-parameters';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { generateState, storeState, buildSocialLandingUri } from '@/utils/social-connectors';
import { storeRedirectContext } from '@/utils/social-redirect-fallback-context';

const useSocial = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const { isPureStepUp } = useStepUpContext();
  const stepUpErrorHandlers = usePureStepUpErrorHandler();

  const handleError = useErrorHandler();
  const abortDirectSignIn = useAbortDirectSignIn();
  const getAuthorizationUrl = useCallback(
    async (connectorId: string, state: string, redirectUri: string) => {
      if (!isPureStepUp) {
        await initInteraction(InteractionEvent.SignIn);
      }

      return getSocialAuthorizationUrl(connectorId, state, redirectUri);
    },
    [isPureStepUp]
  );
  const asyncInvokeSocialSignIn = useApi(getAuthorizationUrl);
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const { setVerificationId } = useContext(UserInteractionContext);

  const redirectTo = useGlobalRedirectTo({
    shouldClearInteractionContextSession: false,
    isReplace: false,
  });

  const nativeSignInHandler = useCallback(
    (redirectTo: string, connector: ExperienceSocialConnector) => {
      const { id: connectorId, platform } = connector;

      const redirectUri =
        platform === ConnectorPlatform.Universal
          ? buildSocialLandingUri(`/social/landing/${connectorId}`, redirectTo).toString()
          : redirectTo;

      getLogtoNativeSdk()?.getPostMessage()({
        callbackUri: `${window.location.origin}/callback/social/${connectorId}`,
        redirectTo: redirectUri,
      });
    },
    []
  );

  const invokeSocialSignInHandler = useCallback(
    async (connector: ExperienceSocialConnector) => {
      /**
       * Check if the user has agreed to the terms and privacy policy before navigating to the 3rd-party social sign-in page
       * when the policy is set to `Manual`
       */
      if (
        !isPureStepUp &&
        agreeToTermsPolicy === AgreeToTermsPolicy.Manual &&
        !(await termsValidation())
      ) {
        // A direct sign-in has no hosted page to return to, so a declined terms modal ends the
        // interaction back at the client. Hosted sign-ins keep their existing behavior.
        await abortDirectSignIn();
        return;
      }

      const { id: connectorId } = connector;

      const state = generateState();
      storeState(state, connectorId);

      const [error, result] = await asyncInvokeSocialSignIn(
        connectorId,
        state,
        `${window.location.origin}/callback/${connectorId}`
      );

      if (error) {
        // Failures before the IdP redirect never reach the callback listener, so a direct sign-in
        // must exit here as well. Hosted sign-ins keep the regular error handling.
        if (!isPureStepUp && (await abortDirectSignIn())) {
          return;
        }

        await handleError(error, stepUpErrorHandlers);

        return;
      }

      if (!result) {
        return;
      }

      const { verificationId, authorizationUri } = result;

      setVerificationId(VerificationType.Social, verificationId);

      // Write fallback bundle to localStorage for in-app browser session recovery
      storeRedirectContext({
        state,
        flow: 'social',
        connectorId,
        verificationId,
        appId: sessionStorage.getItem(searchKeys.appId) ?? undefined,
        organizationId: sessionStorage.getItem(searchKeys.organizationId) ?? undefined,
        uiLocales: sessionStorage.getItem(searchKeys.uiLocales) ?? undefined,
      });

      // Invoke native social sign-in flow
      if (isNativeWebview()) {
        nativeSignInHandler(authorizationUri, connector);

        return;
      }

      // Invoke web social sign-in flow
      await redirectTo(authorizationUri);
    },
    [
      abortDirectSignIn,
      agreeToTermsPolicy,
      asyncInvokeSocialSignIn,
      handleError,
      isPureStepUp,
      nativeSignInHandler,
      redirectTo,
      setVerificationId,
      stepUpErrorHandlers,
      termsValidation,
    ]
  );

  return {
    theme,
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    invokeSocialSignIn: invokeSocialSignInHandler,
  };
};

export default useSocial;
