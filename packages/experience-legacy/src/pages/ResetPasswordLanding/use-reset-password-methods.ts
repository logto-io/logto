import { useMemo } from 'react';

import useIdentifierParams from '@/hooks/use-identifier-params';
import { useForgotPasswordSettings } from '@/hooks/use-sie';

/**
 * Retrieves reset password methods from sign-in experience settings and URL identifier parameters.
 * Note: this is only used for the reset password first screen.
 *
 * Reset password methods fallback logic:
 * 1. If forgot password is not enabled, return an empty array
 * 2. If no identifiers are provided in the URL, return all reset password methods from sign-in experience settings.
 * 3. If identifiers are provided in the URL but none are supported by sign-in experience settings, return all reset password methods from sign-in experience settings.
 * 4. If identifiers are provided in the URL and supported by sign-in experience settings, return the intersection of both.
 */
export const useResetPasswordMethods = () => {
  const { identifiers } = useIdentifierParams();
  const { isForgotPasswordEnabled, enabledMethodSet } = useForgotPasswordSettings();

  return useMemo(() => {
    // If forgot password is not enabled, return an empty array
    if (!isForgotPasswordEnabled) {
      return [];
    }

    const enabledMethods = [...enabledMethodSet];

    if (identifiers.length === 0) {
      return enabledMethods;
    }

    const methods = enabledMethods.filter((identifier) => identifiers.includes(identifier));

    // Fallback to enabled methods if no identifiers are supported
    if (methods.length === 0) {
      return enabledMethods;
    }

    return methods;
  }, [isForgotPasswordEnabled, enabledMethodSet, identifiers]);
};
