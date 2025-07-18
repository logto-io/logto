import { GoogleConnector } from '@logto/connector-kit';
import type { RequestErrorBody } from '@logto/schemas';
import {
  ExtraParamsKey,
  InteractionEvent,
  SignInMode,
  VerificationType,
  experience,
} from '@logto/schemas';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validate } from 'superstruct';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import {
  identifyAndSubmitInteraction,
  initInteraction,
  verifySocialVerification,
} from '@/apis/experience';
import useBindSocialRelatedUser from '@/containers/SocialLinkAccount/use-social-link-related-user';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import useSocialRegister from '@/hooks/use-social-register';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import useToast from '@/hooks/use-toast';
import { socialAccountNotExistErrorDataGuard } from '@/types/guard';
import { parseQueryParameters } from '@/utils';
import { validateGoogleOneTapCsrfToken, validateState } from '@/utils/social-connectors';

const useSocialSignInListener = (connectorId: string) => {
  const [loading, setLoading] = useState(true);
  const { setToast } = useToast();
  const { signInMode, socialSignInSettings } = useSieMethods();
  const { t } = useTranslation();
  const [isConsumed, setIsConsumed] = useState(false);
  const [searchParameters, setSearchParameters] = useSearchParams();
  const { verificationIdsMap, setVerificationId } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[VerificationType.Social];

  // Google One Tap will mutate the verificationId after the initial render
  // We need to store a up to date reference of the verificationId
  const verificationIdRef = useRef(verificationId);

  const navigate = useNavigate();
  const handleError = useErrorHandler();
  const bindSocialRelatedUser = useBindSocialRelatedUser();
  const registerWithSocial = useSocialRegister(connectorId, true);
  const verifySocial = useApi(verifySocialVerification);
  const asyncSignInWithSocial = useApi(identifyAndSubmitInteraction);
  const asyncInitInteraction = useApi(initInteraction);

  const accountNotExistErrorHandler = useCallback(
    async (error: RequestErrorBody) => {
      const [, data] = validate(error.data, socialAccountNotExistErrorDataGuard);
      const { relatedUser } = data ?? {};
      const verificationId = verificationIdRef.current;

      // Redirect to sign-in page if the verificationId is not set properly
      if (!verificationId) {
        setToast(t('error.invalid_session'));
        navigate('/' + experience.routes.signIn);
        return;
      }

      if (relatedUser) {
        if (socialSignInSettings.automaticAccountLinking) {
          await bindSocialRelatedUser(verificationId);
        } else {
          navigate(`/social/link/${connectorId}`, {
            replace: true,
            state: { relatedUser },
          });
        }

        return;
      }

      // Should not let user register new social account under sign-in only mode
      if (signInMode === SignInMode.SignIn) {
        setToast(error.message);
        navigate('/' + experience.routes.signIn);
        return;
      }

      // Register with social
      await registerWithSocial(verificationId);
    },
    [
      bindSocialRelatedUser,
      connectorId,
      navigate,
      registerWithSocial,
      setToast,
      signInMode,
      socialSignInSettings.automaticAccountLinking,
      t,
    ]
  );

  const globalErrorHandler = useCallback(
    async (error: RequestErrorBody) => {
      setToast(error.message);
      navigate('/' + experience.routes.signIn);
    },
    [navigate, setToast]
  );

  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  const signInWithSocialErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.identity_not_exist': accountNotExistErrorHandler,
      ...preSignInErrorHandler,
      global: globalErrorHandler,
    }),
    [preSignInErrorHandler, globalErrorHandler, accountNotExistErrorHandler]
  );

  const verifySocialCallbackData = useCallback(
    async (connectorId: string, data: Record<string, unknown>) => {
      // Check for external Google One Tap credentials from extraParams
      const { [ExtraParamsKey.GoogleOneTapCredential]: externalCredential, ...rest } = data;
      if (externalCredential && typeof externalCredential === 'string') {
        console.log('before init interaction...');
        // External Google One Tap flow - initialize interaction for external scenario
        await asyncInitInteraction(InteractionEvent.SignIn);
        console.log('after init interaction...');
      }

      const [error, result] = await verifySocial(connectorId, {
        verificationId: verificationIdRef.current,
        connectorData: {
          // For validation use only
          redirectUri: `${window.location.origin}/callback/${connectorId}`,
          // Not using `conditional` here to make type inference work.
          ...(externalCredential && typeof externalCredential === 'string'
            ? {
                [GoogleConnector.oneTapParams.credential]: externalCredential,
              }
            : {}),
          ...rest,
        },
      });

      if (error || !result) {
        setLoading(false);
        await handleError(error, { global: globalErrorHandler });
        return;
      }

      const { verificationId } = result;

      // VerificationId might not be available in the UserInteractionContext (Google one tap)
      // Always update the verificationId here
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verificationIdRef.current = verificationId;
      setVerificationId(VerificationType.Social, verificationId);

      return verificationId;
    },
    [asyncInitInteraction, globalErrorHandler, handleError, setVerificationId, verifySocial]
  );

  const signInWithSocialHandler = useCallback(
    async (connectorId: string, data: Record<string, unknown>) => {
      const verificationId = await verifySocialCallbackData(connectorId, data);

      // Exception occurred during verification drop the process
      if (!verificationId) {
        return;
      }
      const [error, result] = await asyncSignInWithSocial({ verificationId });

      if (error) {
        setLoading(false);
        await handleError(error, signInWithSocialErrorHandlers);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncSignInWithSocial, handleError, signInWithSocialErrorHandlers, verifySocialCallbackData]
  );

  // Social Sign-in Callback Handler
  useEffect(() => {
    if (isConsumed) {
      return;
    }

    setIsConsumed(true);

    const { state, ...rest } = parseQueryParameters(searchParameters);

    // Google One Tap always contains the `credential`
    const isGoogleOneTap = Boolean(rest[ExtraParamsKey.GoogleOneTapCredential]);
    // External Google One Tap always contains the `credential` and doesn't contain the `csrfToken`
    // Experience built-in Google One Tap always contains the `csrfToken`
    const isExternalCredential = isGoogleOneTap && !rest[GoogleConnector.oneTapParams.csrfToken];

    console.log('isGoogleOneTap', isGoogleOneTap);
    console.log('isExternalCredential', isExternalCredential);
    console.log('rest', JSON.stringify(rest, null, 2));
    console.log('csrfToken', rest[GoogleConnector.oneTapParams.csrfToken]);
    console.log('state', state);
    console.log(
      'validateGoogleOneTapCsrfToken',
      validateGoogleOneTapCsrfToken(rest[GoogleConnector.oneTapParams.csrfToken])
    );

    // Cleanup the search parameters once it's consumed
    setSearchParameters({}, { replace: true });

    console.log('isGoogleOneTap && isExternalCredential', isGoogleOneTap && isExternalCredential);
    console.log(
      'isGoogleOneTap && !isExternalCredential && validateGoogleOneTapCsrfToken(rest[GoogleConnector.oneTapParams.csrfToken])',
      isGoogleOneTap &&
        !isExternalCredential &&
        validateGoogleOneTapCsrfToken(rest[GoogleConnector.oneTapParams.csrfToken])
    );
    console.log(
      '(!isGoogleOneTap && validateState(state, connectorId))',
      !isGoogleOneTap && validateState(state, connectorId, true)
    );

    // Validate authentication parameters based on different scenarios:
    // 1. Normal social login: requires valid state parameter for CSRF protection
    // 2. Google One Tap from Experience app: requires valid CSRF token
    // 3. Google One Tap from external website: no validation needed (already verified by Google)
    const isValidAuth =
      // Case 1: Normal social login (not Google One Tap) - validate state parameter
      (!isGoogleOneTap && validateState(state, connectorId)) ||
      // Case 2: Google One Tap from Experience app (has CSRF token) - validate CSRF token
      (isGoogleOneTap &&
        !isExternalCredential &&
        validateGoogleOneTapCsrfToken(rest[GoogleConnector.oneTapParams.csrfToken])) ||
      // Case 3: Google One Tap from external website (no CSRF token) - always valid
      (isGoogleOneTap && isExternalCredential);

    console.log('isValidAuth', isValidAuth);

    if (!isValidAuth) {
      setToast(t('error.invalid_connector_auth'));
      navigate('/' + experience.routes.signIn);
      return;
    }

    console.log('verificationIdRef.current', verificationIdRef.current);

    // Validate session based on different scenarios:
    // 1. Normal social login: requires valid verificationId
    // 2. Google One Tap from Experience app: requires valid CSRF token
    // 3. Google One Tap from external website: no validation needed (already verified by Google)
    const isValidSession =
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      verificationIdRef.current ||
      (isGoogleOneTap &&
        !isExternalCredential &&
        validateGoogleOneTapCsrfToken(rest[GoogleConnector.oneTapParams.csrfToken])) ||
      (isGoogleOneTap && isExternalCredential);

    console.log('isValidSession', isValidSession);

    if (!isValidSession) {
      setToast(t('error.invalid_session'));
      navigate('/' + experience.routes.signIn);
      return;
    }

    void signInWithSocialHandler(connectorId, rest);
  }, [
    connectorId,
    isConsumed,
    navigate,
    searchParameters,
    setSearchParameters,
    setToast,
    signInWithSocialHandler,
    t,
  ]);

  return { loading };
};

export default useSocialSignInListener;
