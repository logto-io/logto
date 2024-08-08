import {
  AgreeToTermsPolicy,
  ConnectorPlatform,
  VerificationType,
  type ExperienceSocialConnector,
} from '@logto/schemas';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { getSocialAuthorizationUrl } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useTerms from '@/hooks/use-terms';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { generateState, storeState, buildSocialLandingUri } from '@/utils/social-connectors';

const useSocial = () => {
  const { experienceSettings, theme } = useContext(PageContext);

  const handleError = useErrorHandler();
  const asyncInvokeSocialSignIn = useApi(getSocialAuthorizationUrl);
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
      if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual && !(await termsValidation())) {
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
        await handleError(error);

        return;
      }

      if (!result) {
        return;
      }

      const { verificationId, authorizationUri } = result;

      setVerificationId(VerificationType.Social, verificationId);

      // Invoke native social sign-in flow
      if (isNativeWebview()) {
        nativeSignInHandler(authorizationUri, connector);

        return;
      }

      // Invoke web social sign-in flow
      await redirectTo(authorizationUri);
    },
    [
      agreeToTermsPolicy,
      asyncInvokeSocialSignIn,
      handleError,
      nativeSignInHandler,
      redirectTo,
      setVerificationId,
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
