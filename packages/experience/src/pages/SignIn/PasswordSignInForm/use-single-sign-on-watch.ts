import { SignInIdentifier, type SsoConnectorMetadata } from '@logto/schemas';
import { useEffect, useState, useCallback, useContext } from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import SingleSignOnContext from '@/Providers/SingleSignOnContextProvider/SingleSignOnContext';
import { getSingleSignOnConnectors } from '@/apis/single-sign-on';
import { singleSignOnPath } from '@/constants/env';
import useApi from '@/hooks/use-api';
import useSingleSignOn from '@/hooks/use-single-sign-on';
import { validateEmail } from '@/utils/form';

import type { FormState } from './index';

const useSingleSignOnWatch = (control: Control<FormState>) => {
  const navigate = useNavigate();
  const { setEmail, setSsoConnectors, ssoConnectors, availableSsoConnectorsMap } =
    useContext(SingleSignOnContext);
  const [showSingleSignOn, setShowSingleSignOn] = useState(false);
  const request = useApi(getSingleSignOnConnectors);
  const singleSignOn = useSingleSignOn();

  const isSsoEnabled = availableSsoConnectorsMap.size > 0;

  const identifierInput = useWatch({
    control,
    name: 'identifier',
  });

  /**
   * Silently check if the email is registered with any SSO connectors
   */
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
    if (!showSingleSignOn) {
      setSsoConnectors([]);
      // eslint-disable-next-line unicorn/no-useless-undefined
      setEmail(undefined);
    }
  }, [setEmail, setSsoConnectors, showSingleSignOn]);

  const navigateToSingleSignOn = useCallback(async () => {
    if (!showSingleSignOn) {
      return;
    }

    // If there is only one connector, we can directly invoke the SSO flow
    if (ssoConnectors.length === 1 && ssoConnectors[0]?.id) {
      await singleSignOn(ssoConnectors[0].id);
      return;
    }

    navigate(`/${singleSignOnPath}/connectors`);
  }, [navigate, showSingleSignOn, singleSignOn, ssoConnectors]);

  useEffect(() => {
    if (!isSsoEnabled) {
      return;
    }

    const { type, value } = identifierInput;

    if (type !== SignInIdentifier.Email) {
      setShowSingleSignOn(false);
      return;
    }

    // Will throw an error if the value is not a valid email
    if (validateEmail(value)) {
      setShowSingleSignOn(false);
      return;
    }

    // Add a debouncing delay to avoid unnecessary API calls
    const handler = setTimeout(async () => {
      setShowSingleSignOn(await fetchSsoConnectors(value));
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchSsoConnectors, identifierInput, isSsoEnabled]);

  return {
    showSingleSignOn,
    navigateToSingleSignOn,
  };
};

export default useSingleSignOnWatch;
