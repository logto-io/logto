import { AgreeToTermsPolicy, SignInMode, VerificationType } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { registerWithVerifiedIdentifier, signInWithSso } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useEmailBlockedErrorHandler from '@/hooks/use-email-blocked-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useNavigateToSignIn from '@/hooks/use-navigate-to-sign-in';
import usePrerendering from '@/hooks/use-prerendering';
import useRedirectCallbackValidation from '@/hooks/use-redirect-callback-validation';
import { useSieMethods } from '@/hooks/use-sie';
import useTerms from '@/hooks/use-terms';
import useToast from '@/hooks/use-toast';
import { parseQueryParameters } from '@/utils';

type SingleSignOnRegisterOptions = {
  readonly onEmailBlocked?: (errorCode: string) => void;
};

const useSingleSignOnRegister = ({ onEmailBlocked }: SingleSignOnRegisterOptions = {}) => {
  const handleError = useErrorHandler();
  const emailBlockedErrorHandler = useEmailBlockedErrorHandler({ onConfirm: onEmailBlocked });

  const request = useApi(registerWithVerifiedIdentifier);
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const navigateToSignIn = useNavigateToSignIn();
  const redirectTo = useGlobalRedirectTo();

  return useCallback(
    async (verificationId: string) => {
      /**
       * Agree to terms and conditions first before proceeding
       * If the agreement policy is `Manual`, the user must agree to the terms to reach this step.
       * Therefore, skip the check for `Manual` policy.
       */
      if (agreeToTermsPolicy !== AgreeToTermsPolicy.Manual && !(await termsValidation())) {
        navigateToSignIn();
        return;
      }

      const [error, result] = await request(verificationId);

      if (error) {
        await handleError(error, emailBlockedErrorHandler);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      agreeToTermsPolicy,
      emailBlockedErrorHandler,
      handleError,
      navigateToSignIn,
      redirectTo,
      request,
      termsValidation,
    ]
  );
};

/**
 * Single Sign On authentication callback handler.
 *
 * @remark This hook is used by the Single Sign On authentication sign-in callback page.
 * Read the IdP parameters from the URL and call the Single Sign On authentication API.
 * Forked from @see `useSocialSignInListener`.
 * - SingleSignOn has different API endpoints.
 * - SingleSignOn has different error handling logic.
 */
const useSingleSignOnListener = (connectorId: string) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [isConsumed, setIsConsumed] = useState(false);
  const [searchParameters, setSearchParameters] = useSearchParams();
  const { setToast } = useToast();
  const redirectTo = useGlobalRedirectTo();
  const { signInMode } = useSieMethods();

  const { validateAndRestore } = useRedirectCallbackValidation({
    connectorId,
    flow: 'sso',
    verificationType: VerificationType.EnterpriseSso,
  });

  const prerendering = usePrerendering();
  const handleError = useErrorHandler();

  const singleSignOnAuthorizationRequest = useApi(signInWithSso);

  const navigateToSignIn = useNavigateToSignIn();

  const registerSingleSignOnIdentity = useSingleSignOnRegister({
    onEmailBlocked: navigateToSignIn,
  });

  const singleSignOnHandler = useCallback(
    async (connectorId: string, verificationId: string, data: Record<string, unknown>) => {
      const [error, result] = await singleSignOnAuthorizationRequest(connectorId, {
        verificationId,
        connectorData: {
          ...data,
          // For connector validation use
          redirectUri: `${window.location.origin}/callback/${connectorId}`,
        },
      });

      if (error) {
        setLoading(false);
        await handleError(error, {
          'user.sso_identity_not_exist': async (error) => {
            // Should not let user register new social account under sign-in only mode
            if (signInMode === SignInMode.SignIn) {
              setToast(error.message);
              navigateToSignIn(error.code);
              return;
            }

            await registerSingleSignOnIdentity(verificationId);
          },
          // Redirect to sign-in page if error is not handled by the error handlers
          global: async (error) => {
            setToast(error.message);
            navigateToSignIn(error.code);
          },
        });
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      handleError,
      navigateToSignIn,
      redirectTo,
      registerSingleSignOnIdentity,
      setToast,
      signInMode,
      singleSignOnAuthorizationRequest,
    ]
  );

  // Single Sign On Callback Handler
  useEffect(() => {
    // The callback consumes one-time data (authorization code, state, and possibly the whole
    // interaction on error) — wait for activation when the page is only being prerendered.
    if (prerendering || isConsumed) {
      return;
    }

    setIsConsumed(true);

    const { state, ...rest } = parseQueryParameters(searchParameters);

    // Cleanup the search parameters once it's consumed
    setSearchParameters({}, { replace: true });

    const result = validateAndRestore(state);

    if (!result.valid) {
      setToast(t(`error.${result.error}`));
      navigateToSignIn(result.error);
      return;
    }

    void singleSignOnHandler(connectorId, result.verificationId, rest);
  }, [
    connectorId,
    isConsumed,
    navigateToSignIn,
    prerendering,
    searchParameters,
    setSearchParameters,
    setToast,
    singleSignOnHandler,
    t,
    validateAndRestore,
  ]);

  return { loading };
};

export default useSingleSignOnListener;
