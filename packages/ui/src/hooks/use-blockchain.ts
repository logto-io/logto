import { type ConnectorMetadata, type RequestErrorBody, SignInMode } from '@logto/schemas';
import { useCallback, useContext, useMemo } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { getBlockchainNonce, signInWithBlockchain } from '@/apis/interaction';
import { generateState, storeState } from '@/utils/connectors/social-connectors';

import useApi from './use-api';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';
import useRequiredProfileErrorHandler from './use-required-profile-error-handler';
import { useSieMethods } from './use-sie';
import useSocialRegister from './use-social-register';
import useTerms from './use-terms';
import useToast from './use-toast';

const useBlockchain = (connectorId?: string) => {
  const { experienceSettings, theme } = useContext(PageContext);

  const handleError = useErrorHandler();
  const getNonce = useApi(getBlockchainNonce);

  // Const nativeSignInHandler = useCallback((redirectTo: string, connector: ConnectorMetadata) => {
  //   const { id: connectorId, platform } = connector;

  //   const redirectUri =
  //     platform === 'Universal'
  //       ? buildSocialLandingUri(`/social/landing/${connectorId}`, redirectTo).toString()
  //       : redirectTo;

  //   getLogtoNativeSdk()?.getPostMessage()({
  //     callbackUri: `${window.location.origin}/sign-in/social/${connectorId}`,
  //     redirectTo: redirectUri,
  //   });
  // }, []);

  // TODO: @lbennett share most of this with use-social-sign-in-listener
  const { setToast } = useToast();
  const { termsValidation } = useTerms();
  const { signInMode } = useSieMethods();

  const registerWithSocial = useSocialRegister(connectorId, true);

  const asyncSignInWithBlockchain = useApi(signInWithBlockchain);

  const accountNotExistErrorHandler = useCallback(
    async (_error: RequestErrorBody) => {
      if (!connectorId) {
        return;
      }

      await registerWithSocial(connectorId);
    },
    [connectorId, registerWithSocial]
  );
  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler({
    replace: true,
  });

  const signInWithSocialErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.identity_not_exist': async (error) => {
        // Should not let user register new social account under sign-in only mode
        if (signInMode === SignInMode.SignIn) {
          setToast(error.message);

          return;
        }

        // Agree to terms and conditions first before proceeding
        if (!(await termsValidation())) {
          return;
        }

        await accountNotExistErrorHandler(error);
      },
      ...requiredProfileErrorHandlers,
    }),
    [
      requiredProfileErrorHandlers,
      signInMode,
      termsValidation,
      accountNotExistErrorHandler,
      setToast,
    ]
  );

  const invokeBlockchainSignInHandler = useCallback(
    async (connector: ConnectorMetadata) => {
      const { id: connectorId, name } = connector;

      const state = generateState();
      storeState(connectorId, state);

      const [nonceError, nonceResult] = await getNonce(connectorId, state);

      if (nonceError) {
        await handleError(nonceError);

        return;
      }

      if (!nonceResult?.nonce) {
        // TODO: @lbennett handle error
        return;
      }

      // TODO: @lbennett looking at how to use connector provided client code
      const { signMessage } = await import('../../../connectors/connector-metamask/src/client');

      const { address, signature } = await signMessage(nonceResult.nonce);

      const [error, result] = await asyncSignInWithBlockchain({
        connectorId,
        address,
        signature,
      });

      if (error) {
        await handleError(error, signInWithSocialErrorHandlers);
      }

      if (!result?.redirectTo) {
        return;
      }

      // Invoke Web Social Sign In flow
      window.location.assign(result.redirectTo);
    },
    [
      getNonce,
      asyncSignInWithBlockchain,
      signInWithSocialErrorHandlers,
      handleError /* nativeSignInHandler */,
    ]
  );

  return {
    theme,
    connectors: experienceSettings?.connectors ?? [],
    invokeBlockchainSignIn: invokeBlockchainSignInHandler,
  };
};

export default useBlockchain;
