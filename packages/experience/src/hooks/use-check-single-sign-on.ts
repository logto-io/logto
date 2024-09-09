import { experience, type SsoConnectorMetadata } from '@logto/schemas';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { getSsoConnectors } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';

import useSingleSignOn from './use-single-sign-on';

const useCheckSingleSignOn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const request = useApi(getSsoConnectors);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { setSsoEmail, setSsoConnectors, availableSsoConnectorsMap } =
    useContext(UserInteractionContext);
  const singleSignOn = useSingleSignOn();

  const handleError = useErrorHandler();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, [setErrorMessage]);

  // Should clear the context and storage if the user trying to resubmit the form
  const clearContext = useCallback(() => {
    setSsoEmail(undefined);
    setSsoConnectors([]);
  }, [setSsoEmail, setSsoConnectors]);

  /**
   * Check if the email is registered with any SSO connectors
   * @param {string} email
   * @param {boolean} continueSignIn - whether to continue the single sign-on flow if the email is registered with any SSO connectors
   * @returns {Promise<boolean>} - true if the email is registered with any SSO connectors
   */
  const onSubmit = useCallback(
    async (email: string, continueSignIn = false) => {
      clearContext();

      const [error, result] = await request(email);

      if (error) {
        // Show error message only if the user is trying to continue the single sign-on flow, otherwise, silently fail
        if (continueSignIn) {
          await handleError(error, {
            'guard.invalid_input': () => {
              setErrorMessage(t('error.invalid_email'));
            },
          });
        }

        return;
      }

      const connectors = result?.connectorIds
        .map((connectorId) => availableSsoConnectorsMap.get(connectorId))
        // eslint-disable-next-line unicorn/prefer-native-coercion-functions -- make the type more specific
        .filter((connector): connector is SsoConnectorMetadata => Boolean(connector));

      if (!connectors || connectors.length === 0) {
        setErrorMessage(t('error.sso_not_enabled'));
        return;
      }

      setSsoConnectors(connectors);
      setSsoEmail(email);

      if (!continueSignIn) {
        return true;
      }

      // If there is only one connector, we can directly invoke the SSO flow
      if (connectors.length === 1 && connectors[0]?.id) {
        await singleSignOn(connectors[0].id);
        return true;
      }

      navigate(`/${experience.routes.sso}/connectors`);
      return true;
    },
    [
      clearContext,
      request,
      setSsoConnectors,
      setSsoEmail,
      navigate,
      handleError,
      t,
      availableSsoConnectorsMap,
      singleSignOn,
    ]
  );

  return {
    onSubmit,
    errorMessage,
    clearErrorMessage,
  };
};

export default useCheckSingleSignOn;
