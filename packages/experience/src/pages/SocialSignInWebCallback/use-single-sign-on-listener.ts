import { AgreeToTermsPolicy, SignInMode, VerificationType, experience } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { registerWithVerifiedIdentifier, signInWithSso } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import { useSieMethods } from '@/hooks/use-sie';
import useTerms from '@/hooks/use-terms';
import useToast from '@/hooks/use-toast';
import { parseQueryParameters } from '@/utils';
import { validateState } from '@/utils/social-connectors';

const useSingleSignOnRegister = () => {
  const handleError = useErrorHandler();
  const request = useApi(registerWithVerifiedIdentifier);
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const navigate = useNavigate();
  const redirectTo = useGlobalRedirectTo();

  return useCallback(
    async (verificationId: string) => {
      /**
       * Agree to terms and conditions first before proceeding
       * If the agreement policy is `Manual`, the user must agree to the terms to reach this step.
       * Therefore, skip the check for `Manual` policy.
       */
      if (agreeToTermsPolicy !== AgreeToTermsPolicy.Manual && !(await termsValidation())) {
        navigate('/' + experience.routes.signIn);
        return;
      }

      const [error, result] = await request(verificationId);

      if (error) {
        await handleError(error);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [agreeToTermsPolicy, handleError, navigate, redirectTo, request, termsValidation]
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
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[VerificationType.EnterpriseSso];

  const handleError = useErrorHandler();
  const navigate = useNavigate();

  const singleSignOnAuthorizationRequest = useApi(signInWithSso);
  const registerSingleSignOnIdentity = useSingleSignOnRegister();

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
          'user.identity_not_exist': async (error) => {
            // Should not let user register new social account under sign-in only mode
            if (signInMode === SignInMode.SignIn) {
              setToast(error.message);
              navigate('/' + experience.routes.signIn);
              return;
            }

            await registerSingleSignOnIdentity(verificationId);
          },
          // Redirect to sign-in page if error is not handled by the error handlers
          global: async (error) => {
            setToast(error.message);
            navigate('/' + experience.routes.signIn);
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
      navigate,
      redirectTo,
      registerSingleSignOnIdentity,
      setToast,
      signInMode,
      singleSignOnAuthorizationRequest,
    ]
  );

  // Single Sign On Callback Handler
  useEffect(() => {
    if (isConsumed) {
      return;
    }

    setIsConsumed(true);

    const { state, ...rest } = parseQueryParameters(searchParameters);

    // Cleanup the search parameters once it's consumed
    setSearchParameters({}, { replace: true });

    // Validate the state parameter
    if (!validateState(state, connectorId)) {
      setToast(t('error.invalid_connector_auth'));
      navigate('/' + experience.routes.signIn);
      return;
    }

    // Validate the verificationId
    if (!verificationId) {
      setToast(t('error.invalid_session'));
      navigate('/' + experience.routes.signIn);
      return;
    }

    void singleSignOnHandler(connectorId, verificationId, rest);
  }, [
    connectorId,
    isConsumed,
    navigate,
    searchParameters,
    setSearchParameters,
    setToast,
    singleSignOnHandler,
    t,
    verificationId,
  ]);

  return { loading };
};

export default useSingleSignOnListener;
