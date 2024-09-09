import {
  AgreeToTermsPolicy,
  SignInIdentifier,
  experience,
  type SsoConnectorMetadata,
} from '@logto/schemas';
import { useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import SingleSignOnFormModeContext from '@/Providers/SingleSignOnFormModeContextProvider/SingleSignOnFormModeContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { getSingleSignOnConnectors } from '@/apis/single-sign-on';
import type { IdentifierInputValue } from '@/components/InputFields/SmartInputField';
import useApi from '@/hooks/use-api';
import useSingleSignOn from '@/hooks/use-single-sign-on';
import { validateEmail } from '@/utils/form';

import { useSieMethods } from './use-sie';
import useTerms from './use-terms';

const useSingleSignOnWatch = (identifierInput?: IdentifierInputValue) => {
  const navigate = useNavigate();

  const { singleSignOnEnabled } = useSieMethods();

  const { setSsoEmail, setSsoConnectors, ssoConnectors, availableSsoConnectorsMap } =
    useContext(UserInteractionContext);

  const { showSingleSignOnForm, setShowSingleSignOnForm } = useContext(SingleSignOnFormModeContext);

  const request = useApi(getSingleSignOnConnectors, { silent: true });

  const singleSignOn = useSingleSignOn();

  const { termsValidation, agreeToTermsPolicy } = useTerms();

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
      setSsoEmail(email);
      return true;
    },
    [availableSsoConnectorsMap, request, setSsoEmail, setSsoConnectors]
  );

  // Reset the ssoContext
  useEffect(() => {
    if (!showSingleSignOnForm) {
      setSsoConnectors([]);

      setSsoEmail(undefined);
    }
  }, [setSsoEmail, setSsoConnectors, showSingleSignOnForm]);

  const navigateToSingleSignOn = useCallback(async () => {
    if (!showSingleSignOnForm) {
      return;
    }

    /**
     * Check if the user has agreed to the terms and privacy policy before single sign on when the policy is set to `Manual`
     */
    if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual && !(await termsValidation())) {
      return;
    }

    // If there is only one connector, we can directly invoke the SSO flow
    if (ssoConnectors.length === 1 && ssoConnectors[0]?.id) {
      await singleSignOn(ssoConnectors[0].id);
      return;
    }

    navigate(`/${experience.routes.sso}/connectors`);
  }, [
    agreeToTermsPolicy,
    navigate,
    showSingleSignOnForm,
    singleSignOn,
    ssoConnectors,
    termsValidation,
  ]);

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
