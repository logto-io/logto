import { SignInIdentifier, type SsoConnectorMetadata } from '@logto/schemas';
import { useEffect, useState, useCallback, useContext } from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import SingleSignOnContext from '@/Providers/SingleSignOnContextProvider/SingleSignOnContext';
import { getSingleSignOnConnectors } from '@/apis/single-sign-on';
import { singleSignOnPath } from '@/constants/env';
import useApi from '@/hooks/use-api';
import { validateEmail } from '@/utils/form';

import type { FormState } from './index';

const useSingleSignOnWatch = (control: Control<FormState>) => {
  const navigate = useNavigate();
  const { setEmail, setSsoConnectors, availableSsoConnectorsMap } = useContext(SingleSignOnContext);
  const [showSingleSignOn, setShowSingleSignOn] = useState(false);
  const request = useApi(getSingleSignOnConnectors);

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

  const navigateToSingleSignOn = useCallback(() => {
    navigate(`/${singleSignOnPath}/connectors`);
  }, [navigate]);

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
