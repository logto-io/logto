import { GoogleConnector } from '@logto/connector-kit';
import type { RequestErrorBody } from '@logto/schemas';
import { AgreeToTermsPolicy, InteractionEvent, SignInMode, experience } from '@logto/schemas';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validate } from 'superstruct';

import { putInteraction, signInWithSocial } from '@/apis/interaction';
import useBindSocialRelatedUser from '@/containers/SocialLinkAccount/use-social-link-related-user';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import useSocialRegister from '@/hooks/use-social-register';
import useTerms from '@/hooks/use-terms';
import useToast from '@/hooks/use-toast';
import { socialAccountNotExistErrorDataGuard } from '@/types/guard';
import { parseQueryParameters } from '@/utils';
import { validateGoogleOneTapCsrfToken, validateState } from '@/utils/social-connectors';

const useSocialSignInListener = (connectorId: string) => {
  const [loading, setLoading] = useState(true);
  const { setToast } = useToast();
  const { signInMode, socialSignInSettings } = useSieMethods();
  const { t } = useTranslation();
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const [isConsumed, setIsConsumed] = useState(false);
  const [searchParameters, setSearchParameters] = useSearchParams();

  const navigate = useNavigate();
  const handleError = useErrorHandler();
  const bindSocialRelatedUser = useBindSocialRelatedUser();
  const registerWithSocial = useSocialRegister(connectorId, true);
  const asyncSignInWithSocial = useApi(signInWithSocial);
  const asyncPutInteraction = useApi(putInteraction);

  const accountNotExistErrorHandler = useCallback(
    async (error: RequestErrorBody) => {
      const [, data] = validate(error.data, socialAccountNotExistErrorDataGuard);
      const { relatedUser } = data ?? {};

      if (relatedUser) {
        if (socialSignInSettings.automaticAccountLinking) {
          const { type, value } = relatedUser;
          await bindSocialRelatedUser({
            connectorId,
            ...(type === 'email' ? { email: value } : { phone: value }),
          });
        } else {
          navigate(`/social/link/${connectorId}`, {
            replace: true,
            state: { relatedUser },
          });
        }

        return;
      }

      // Register with social
      await registerWithSocial(connectorId);
    },
    [
      bindSocialRelatedUser,
      connectorId,
      navigate,
      registerWithSocial,
      socialSignInSettings.automaticAccountLinking,
    ]
  );

  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

  const signInWithSocialErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.identity_not_exist': async (error) => {
        // Should not let user register new social account under sign-in only mode
        if (signInMode === SignInMode.SignIn) {
          setToast(error.message);
          navigate('/' + experience.routes.signIn);
          return;
        }

        /**
         * Agree to terms and conditions first before proceeding
         * If the agreement policy is `Manual`, the user must agree to the terms to reach this step.
         * Therefore, skip the check for `Manual` policy.
         */
        if (agreeToTermsPolicy !== AgreeToTermsPolicy.Manual && !(await termsValidation())) {
          navigate('/' + experience.routes.signIn);
          return;
        }

        await accountNotExistErrorHandler(error);
      },
      ...preSignInErrorHandler,
      // Redirect to sign-in page if error is not handled by the error handlers
      global: async (error) => {
        setToast(error.message);
        navigate('/' + experience.routes.signIn);
      },
    }),
    [
      preSignInErrorHandler,
      signInMode,
      agreeToTermsPolicy,
      termsValidation,
      accountNotExistErrorHandler,
      setToast,
      navigate,
    ]
  );

  const signInWithSocialHandler = useCallback(
    async (connectorId: string, data: Record<string, unknown>) => {
      // When the callback is called from Google One Tap, the interaction event was not set yet.
      if (data[GoogleConnector.oneTapParams.csrfToken]) {
        await asyncPutInteraction(InteractionEvent.SignIn);
      }

      const [error, result] = await asyncSignInWithSocial({
        connectorId,
        connectorData: {
          // For validation use only
          redirectUri: `${window.location.origin}/callback/${connectorId}`,
          ...data,
        },
      });

      if (error) {
        setLoading(false);
        await handleError(error, signInWithSocialErrorHandlers);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncPutInteraction, asyncSignInWithSocial, handleError, signInWithSocialErrorHandlers]
  );

  // Social Sign-in Callback Handler
  useEffect(() => {
    if (isConsumed) {
      return;
    }

    setIsConsumed(true);

    const { state, ...rest } = parseQueryParameters(searchParameters);

    // Cleanup the search parameters once it's consumed
    setSearchParameters({}, { replace: true });

    if (
      !validateState(state, connectorId) &&
      !validateGoogleOneTapCsrfToken(rest[GoogleConnector.oneTapParams.csrfToken])
    ) {
      setToast(t('error.invalid_connector_auth'));
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
