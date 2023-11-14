import { type SsoConnectorMetadata } from '@logto/schemas';
import { useCallback, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import SingleSignOnContext from '@/Providers/SingleSignOnContextProvider/SingleSignOnContext';
import { getSingleSignOnConnectors } from '@/apis/single-sign-on';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';

const useOnSubmit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const request = useApi(getSingleSignOnConnectors);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { setEmail, setSsoConnectors, availableSsoConnectorsMap } = useContext(SingleSignOnContext);

  const handleError = useErrorHandler();

  const clearErrorMessage = useCallback(() => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    setErrorMessage(undefined);
  }, [setErrorMessage]);

  // Should clear the context and storage if the user trying to resubmit the form
  const clearContext = useCallback(() => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    setEmail(undefined);
    setSsoConnectors([]);
  }, [setEmail, setSsoConnectors]);

  const onSubmit = useCallback(
    async (email: string) => {
      clearContext();

      const [error, result] = await request(email);

      if (error) {
        await handleError(error);
        return;
      }

      const connectors = result
        ?.map((connectorId) =>
          availableSsoConnectorsMap.has(connectorId)
            ? availableSsoConnectorsMap.get(connectorId)
            : undefined
        )
        // eslint-disable-next-line unicorn/prefer-native-coercion-functions -- make the type more specific
        .filter((connector): connector is SsoConnectorMetadata => Boolean(connector));

      if (!connectors || connectors.length === 0) {
        setErrorMessage(t('error.sso_not_enabled'));
        return;
      }

      setSsoConnectors(connectors);
      setEmail(email);

      navigate('../connectors');
    },
    [
      availableSsoConnectorsMap,
      clearContext,
      handleError,
      navigate,
      request,
      setEmail,
      setSsoConnectors,
      t,
    ]
  );

  return {
    onSubmit,
    errorMessage,
    clearErrorMessage,
  };
};

export default useOnSubmit;
