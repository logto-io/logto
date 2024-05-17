import { SignInIdentifier, experience, type SsoConnectorMetadata } from '@logto/schemas';
import { useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import SingleSignOnContext from '@/Providers/SingleSignOnContextProvider/SingleSignOnContext';
import SingleSignOnFormModeContext from '@/Providers/SingleSignOnFormModeContextProvider/SingleSignOnFormModeContext';
import { getSingleSignOnConnectors } from '@/apis/single-sign-on';
import type { IdentifierInputValue } from '@/components/InputFields/SmartInputField';
import useApi from '@/hooks/use-api';
import useSingleSignOn from '@/hooks/use-single-sign-on';
import { validateEmail } from '@/utils/form';

import { useSieMethods } from './use-sie';

const useSingleSignOnWatch = (identifierInput?: IdentifierInputValue) => {
  const navigate = useNavigate();

  const { singleSignOnEnabled } = useSieMethods();

  const { setEmail, setSsoConnectors, ssoConnectors, availableSsoConnectorsMap } =
    useContext(SingleSignOnContext);

  const { showSingleSignOnForm, setShowSingleSignOnForm } = useContext(SingleSignOnFormModeContext);

  const request = useApi(getSingleSignOnConnectors, { silent: true });

  const singleSignOn = useSingleSignOn();

  // Silently check if the email is registered with any SSO connectors
  const fetchSsoConnectors = useCallback(
    async (email: string) => {
      const [, result] = await request(email);

      if (!result) {
        return false;
      }

      const connectors = result
        .map((connectorId) => availableSsoConnectorsMap.get(connectorId))
        // eslint-disable-next-line unicorn/prefer-native-coercion-functions -- make the type more specific
        .filter((connector): connector is SsoConnectorMetadata => Boolean(connector));

      if (connectors.length === 0) {
        return false;
      }

      setSsoConnectors(connectors);
      setEmail(email);
      return true;
    },
    [availableSsoConnectorsMap, request, setEmail, setSsoConnectors]
  );

  // Reset the ssoContext
  useEffect(() => {
    if (!showSingleSignOnForm) {
      setSsoConnectors([]);

      setEmail(undefined);
    }
  }, [setEmail, setSsoConnectors, showSingleSignOnForm]);

  const navigateToSingleSignOn = useCallback(async () => {
    if (!showSingleSignOnForm) {
      return;
    }

    // If there is only one connector, we can directly invoke the SSO flow
    if (ssoConnectors.length === 1 && ssoConnectors[0]?.id) {
      await singleSignOn(ssoConnectors[0].id);
      return;
    }

    navigate(`/${experience.routes.sso}/connectors`);
  }, [navigate, showSingleSignOnForm, singleSignOn, ssoConnectors]);

  useEffect(() => {
    if (!singleSignOnEnabled) {
      return;
    }

    // Input is undefined if no user interaction has happened
    if (!identifierInput) {
      setShowSingleSignOnForm(false);
      return;
    }

    const { type, value } = identifierInput;

    if (type !== SignInIdentifier.Email) {
      setShowSingleSignOnForm(false);
      return;
    }

    // Will throw an error if the value is not a valid email
    if (validateEmail(value)) {
      setShowSingleSignOnForm(false);
      return;
    }

    // Add a debouncing delay to avoid unnecessary API calls
    const handler = setTimeout(async () => {
      setShowSingleSignOnForm(await fetchSsoConnectors(value));
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchSsoConnectors, identifierInput, setShowSingleSignOnForm, singleSignOnEnabled]);

  return {
    showSingleSignOnForm,
    navigateToSingleSignOn,
  };
};

export default useSingleSignOnWatch;
