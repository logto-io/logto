import { SignInMode, experience } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { singleSignOnAuthorization, singleSignOnRegistration } from '@/apis/single-sign-on';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import useTerms from '@/hooks/use-terms';
import useToast from '@/hooks/use-toast';
import { parseQueryParameters } from '@/utils';
import { stateValidation } from '@/utils/social-connectors';

const useSingleSignOnRegister = () => {
  const handleError = useErrorHandler();
  const request = useApi(singleSignOnRegistration);
  const { termsValidation } = useTerms();
  const navigate = useNavigate();

  return useCallback(
    async (connectorId: string) => {
      // Agree to terms and conditions first before proceeding
      if (!(await termsValidation())) {
        navigate('/' + experience.routes.signIn);
        return;
      }

      const [error, result] = await request(connectorId);

      if (error) {
        await handleError(error);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [handleError, navigate, request, termsValidation]
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
  const { signInMode } = useSieMethods();

  const handleError = useErrorHandler();
  const navigate = useNavigate();

  const singleSignOnAuthorizationRequest = useApi(singleSignOnAuthorization);
  const registerSingleSignOnIdentity = useSingleSignOnRegister();

  const singleSignOnHandler = useCallback(
    async (connectorId: string, data: Record<string, unknown>) => {
      const [error, result] = await singleSignOnAuthorizationRequest(connectorId, {
        ...data,
        // For connector validation use
        redirectUri: `${window.location.origin}/callback/${connectorId}`,
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

            await registerSingleSignOnIdentity(connectorId);
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
        window.location.replace(result.redirectTo);
      }
    },
    [
      handleError,
      navigate,
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
    if (!state || !stateValidation(state, connectorId)) {
      setToast(t('error.invalid_connector_auth'));
      navigate('/' + experience.routes.signIn);
      return;
    }

    void singleSignOnHandler(connectorId, rest);
  }, [
    connectorId,
    isConsumed,
    navigate,
    searchParameters,
    setSearchParameters,
    setToast,
    singleSignOnHandler,
    t,
  ]);

  return { loading };
};

export default useSingleSignOnListener;
