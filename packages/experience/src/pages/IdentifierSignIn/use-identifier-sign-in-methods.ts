import { useContext, useMemo } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
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
  const { signInMethods, passkeySignIn } = useSieMethods();
  const { hasBoundPasskey } = useContext(UserInteractionContext);
  const { identifiers } = useIdentifierParams();

  const methods = useMemo(() => {
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

  // Hide password input field only if passkey sign-in is enabled and the "Continue with passkey." is hidden.
  // The user enters their identifier on the first screen, then selects a verification method (password or passkey) on the next step.
  const isIdentifierFirstPasskeySignInConfig =
    passkeySignIn?.enabled && !passkeySignIn.showPasskeyButton;

  const isPasswordOnly = useMemo(
    () =>
      signInMethods.length > 0 &&
      signInMethods.every(({ password, verificationCode }) => password && !verificationCode) &&
      !isIdentifierFirstPasskeySignInConfig,
    [signInMethods, isIdentifierFirstPasskeySignInConfig]
  );

  return useMemo(
    () => ({
      signInMethods: methods,
      isPasswordOnly,
      isPasskeySignInEnabled: Boolean(passkeySignIn?.enabled),
      identifierHasBoundPasskey: hasBoundPasskey,
    }),
    [methods, isPasswordOnly, passkeySignIn?.enabled, hasBoundPasskey]
  );
};

export default useIdentifierSignInMethods;
