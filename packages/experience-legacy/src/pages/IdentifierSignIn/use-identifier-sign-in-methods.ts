import { useMemo } from 'react';

import useIdentifierParams from '@/hooks/use-identifier-params';
import { useSieMethods } from '@/hooks/use-sie';

/**
 * Read sign-in methods from sign-in experience config and URL identifier parameters.
 *
 * Sign-in methods fallback logic:
 * 1. If no identifiers are provided in the URL, return all sign-in methods from sign-in experience config.
 * 2. If identifiers are provided in the URL but all of them are not supported by the sign-in experience config, return all sign-in methods from sign-in experience config.
 * 3. If identifiers are provided in the URL and supported by the sign-in experience config, return the intersection of the two.
 */
const useIdentifierSignInMethods = () => {
  const { signInMethods } = useSieMethods();
  const { identifiers } = useIdentifierParams();

  return useMemo(() => {
    // Fallback to all sign-in methods if no identifiers are provided
    if (identifiers.length === 0) {
      return signInMethods;
    }

    const methods = signInMethods.filter(({ identifier }) => identifiers.includes(identifier));

    // Fallback to all sign-in methods if no identifiers are supported
    if (methods.length === 0) {
      return signInMethods;
    }

    return methods;
  }, [identifiers, signInMethods]);
};

export default useIdentifierSignInMethods;
