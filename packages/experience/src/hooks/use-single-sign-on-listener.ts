import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { singleSignOnAuthorization } from '@/apis/single-sign-on';
import { parseQueryParameters } from '@/utils';
import { stateValidation } from '@/utils/social-connectors';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useToast from './use-toast';

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

  const [isConsumed, setIsConsumed] = useState(false);
  const [searchParameters, setSearchParameters] = useSearchParams();
  const { setToast } = useToast();

  const handleError = useErrorHandler();

  const singleSignOnAuthorizationRequest = useApi(singleSignOnAuthorization);

  const singleSignOnHandler = useCallback(
    async (connectorId: string, data: Record<string, unknown>) => {
      const [error, result] = await singleSignOnAuthorizationRequest(connectorId, {
        ...data,
        // For connector validation use
        redirectUri: `${window.location.origin}/callback/${connectorId}`,
      });

      if (error) {
        await handleError(error);
        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [handleError, singleSignOnAuthorizationRequest]
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
      return;
    }

    void singleSignOnHandler(connectorId, rest);
  }, [
    connectorId,
    isConsumed,
    searchParameters,
    setSearchParameters,
    setToast,
    singleSignOnHandler,
    t,
  ]);
};

export default useSingleSignOnListener;
