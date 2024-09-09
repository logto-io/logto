import { GoogleConnector } from '@logto/connector-kit';
import type { RequestErrorBody } from '@logto/schemas';
import { InteractionEvent, SignInMode, VerificationType, experience } from '@logto/schemas';
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
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import useSocialRegister from '@/hooks/use-social-register';
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

  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

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
      // When the callback is called from Google One Tap, the interaction event was not set yet.
      if (data[GoogleConnector.oneTapParams.csrfToken]) {
        await asyncInitInteraction(InteractionEvent.SignIn);
      }

      const [error, result] = await verifySocial(connectorId, {
        verificationId: verificationIdRef.current,
        connectorData: {
          // For validation use only
          redirectUri: `${window.location.origin}/callback/${connectorId}`,
          ...data,
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

    const isGoogleOneTap = validateGoogleOneTapCsrfToken(
      rest[GoogleConnector.oneTapParams.csrfToken]
    );

    // Cleanup the search parameters once it's consumed
    setSearchParameters({}, { replace: true });

    if (!validateState(state, connectorId) && !isGoogleOneTap) {
      setToast(t('error.invalid_connector_auth'));
      navigate('/' + experience.routes.signIn);
      return;
    }

    if (!verificationIdRef.current && !isGoogleOneTap) {
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
