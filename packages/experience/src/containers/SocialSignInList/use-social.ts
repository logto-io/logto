import {
  AgreeToTermsPolicy,
  ConnectorPlatform,
  type ExperienceSocialConnector,
} from '@logto/schemas';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { getSocialAuthorizationUrl } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useTerms from '@/hooks/use-terms';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { generateState, storeState, buildSocialLandingUri } from '@/utils/social-connectors';

const useSocial = () => {
  const { experienceSettings, theme } = useContext(PageContext);

  const handleError = useErrorHandler();
  const asyncInvokeSocialSignIn = useApi(getSocialAuthorizationUrl);
  const { termsValidation, agreeToTermsPolicy } = useTerms();

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

      if (!result?.redirectTo) {
        return;
      }

      // Invoke native social sign-in flow
      if (isNativeWebview()) {
        nativeSignInHandler(result.redirectTo, connector);

        return;
      }

      // Invoke web social sign-in flow
      window.location.assign(result.redirectTo);
    },
    [agreeToTermsPolicy, asyncInvokeSocialSignIn, handleError, nativeSignInHandler, termsValidation]
  );

  return {
    theme,
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    invokeSocialSignIn: invokeSocialSignInHandler,
  };
};

export default useSocial;
