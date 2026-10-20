import { SiweConnector } from '@logto/connector-kit';
import {
  AgreeToTermsPolicy,
  ConnectorPlatform,
  InteractionEvent,
  VerificationType,
  type ExperienceSocialConnector,
} from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import useWalletModal from '@/Providers/WalletModalProvider/use-wallet-modal';
import {
  getSocialAuthorizationUrl,
  identifyUser,
  initInteraction,
  verifySocialVerification,
} from '@/apis/experience';
import { stepUpRoutes } from '@/constants/step-up';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useStepUpContext from '@/hooks/use-step-up-context';
import { usePureStepUpErrorHandler } from '@/hooks/use-step-up-error-handler';
import useTerms from '@/hooks/use-terms';
import useToast from '@/hooks/use-toast';
import { searchKeys } from '@/shared/utils/search-parameters';
import { SearchParameters } from '@/types';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { generateState, storeState, buildSocialLandingUri } from '@/utils/social-connectors';
import { storeRedirectContext } from '@/utils/social-redirect-fallback-context';
import {
  discoverEvmWallets,
  parseSiweAuthorizationParams,
  signInWithEvmWallet,
  WalletError,
  type EvmWallet,
  type WalletErrorCode,
} from '@/utils/wallet/evm';

const walletErrorMessages = {
  not_found: 'error.wallet_not_found',
  rejected: 'error.wallet_request_rejected',
  unsupported_chain: 'error.wallet_unsupported_chain',
  unknown: 'error.unknown',
} as const satisfies Record<WalletErrorCode, string>;

const useSocial = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const { isPureStepUp, refetch: refetchStepUpContext } = useStepUpContext();
  const stepUpErrorHandlers = usePureStepUpErrorHandler();
  const { show: showWalletModal } = useWalletModal();
  const { setToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigateWithPreservedSearchParams();

  const handleError = useErrorHandler();
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
  const asyncVerifySocial = useApi(verifySocialVerification);
  const asyncIdentifyUser = useApi(identifyUser);
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const { setVerificationId } = useContext(UserInteractionContext);

  const redirectTo = useGlobalRedirectTo({
    shouldClearInteractionContextSession: false,
    isReplace: false,
  });

  const selectWallet = useCallback(
    async (wallets: EvmWallet[]) => {
      const [firstWallet] = wallets;

      if (!firstWallet) {
        throw new WalletError('not_found');
      }

      if (wallets.length === 1) {
        return firstWallet;
      }

      const selected = await showWalletModal(
        wallets.map(({ id, name, icon }) => ({ id, name, icon }))
      );

      if (!selected) {
        return;
      }

      return wallets.find(({ id }) => id === selected.id);
    },
    [showWalletModal]
  );

  const requestWalletSignature = useCallback(
    async (authorizationUri: string) => {
      try {
        const params = parseSiweAuthorizationParams(authorizationUri);
        const wallet = await selectWallet(await discoverEvmWallets());

        if (!wallet) {
          return;
        }

        return await signInWithEvmWallet(wallet, params);
      } catch (error: unknown) {
        if (error instanceof WalletError) {
          setToast(t(walletErrorMessages[error.code]));
          return;
        }

        await handleError(error);
      }
    },
    [handleError, selectWallet, setToast, t]
  );

  const walletSignInHandler = useCallback(
    async (
      connector: ExperienceSocialConnector,
      authorizationUri: string,
      verificationId: string
    ) => {
      // Wallet extensions cannot be injected into a native webview. The connector is a web
      // connector, so it should normally be filtered out before this point.
      if (isNativeWebview()) {
        setToast(t('error.wallet_not_supported'));
        return;
      }

      const signed = await requestWalletSignature(authorizationUri);

      if (!signed) {
        return;
      }

      const [verifyError, verifyResult] = await asyncVerifySocial(connector.id, {
        verificationId,
        connectorData: signed,
      });

      if (verifyError || !verifyResult) {
        await handleError(verifyError, {
          ...(isPureStepUp ? stepUpErrorHandlers : {}),
          'connector.invalid_response': () => {
            setToast(t('error.wallet_signature_invalid'));
          },
        });
        return;
      }

      setVerificationId(VerificationType.Social, verifyResult.verificationId);

      // In pure step-up the wallet is used as subject proof. The step-up landing page continues
      // the flow; the social callback page is reserved for normal sign-in and registration.
      if (isPureStepUp) {
        const [identifyError] = await asyncIdentifyUser({
          verificationId: verifyResult.verificationId,
        });

        if (identifyError) {
          await handleError(identifyError, stepUpErrorHandlers);
          return;
        }

        // The wallet flow runs in place on the step-up landing. Navigation alone does not remount
        // the page or reload its context, so refresh it before returning to the landing.
        await refetchStepUpContext();
        navigate(stepUpRoutes.landing, { replace: true });
        return;
      }

      // The signature is already verified. Reuse the existing social callback page with a marker
      // that skips verification (the connector session has been consumed) and continues with
      // account linking, registration, profile fulfillment, and MFA.
      navigate(
        {
          pathname: `/callback/social/${connector.id}`,
          search: `${SearchParameters.SiweCallback}=1`,
        },
        { replace: true }
      );
    },
    [
      asyncIdentifyUser,
      asyncVerifySocial,
      handleError,
      isPureStepUp,
      navigate,
      refetchStepUpContext,
      requestWalletSignature,
      setToast,
      setVerificationId,
      stepUpErrorHandlers,
      t,
    ]
  );

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
        return;
      }

      const { id: connectorId, target } = connector;
      const isSiweConnector = target === SiweConnector.target;

      const state = generateState();

      if (!isSiweConnector) {
        storeState(state, connectorId);
      }

      const [error, result] = await asyncInvokeSocialSignIn(
        connectorId,
        state,
        `${window.location.origin}/callback/${connectorId}`
      );

      if (error) {
        await handleError(error, stepUpErrorHandlers);

        return;
      }

      if (!result) {
        return;
      }

      const { verificationId, authorizationUri } = result;

      if (isSiweConnector) {
        await walletSignInHandler(connector, authorizationUri, verificationId);
        return;
      }

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
      agreeToTermsPolicy,
      asyncInvokeSocialSignIn,
      handleError,
      isPureStepUp,
      nativeSignInHandler,
      redirectTo,
      setVerificationId,
      stepUpErrorHandlers,
      termsValidation,
      walletSignInHandler,
    ]
  );

  return {
    theme,
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    invokeSocialSignIn: invokeSocialSignInHandler,
  };
};

export default useSocial;
