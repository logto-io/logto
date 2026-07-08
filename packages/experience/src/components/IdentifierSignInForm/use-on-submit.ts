import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import useCheckSingleSignOn from '@/hooks/use-check-single-sign-on';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import { useSieMethods } from '@/hooks/use-sie';
import useStartIdentifierPasskeySignInProcessing from '@/hooks/use-start-identifier-passkey-sign-in-processing';
import useToast from '@/hooks/use-toast';
import { UserFlow } from '@/types';

const useOnSubmit = (signInMethods: SignIn['methods']) => {
  const navigate = useNavigateWithPreservedSearchParams();
  const { setToast } = useToast();
  const { t } = useTranslation();
  const { ssoConnectors, passkeySignIn } = useSieMethods();
  const { onSubmit: checkSingleSignOn } = useCheckSingleSignOn();
  const { setIdentifierInputValue } = useContext(UserInteractionContext);
  const { startProcessing: startIdentifierPasskeySignInProcessing } =
    useStartIdentifierPasskeySignInProcessing({
      hideErrorToast: true,
    });

  const navigateToPasswordPage = useCallback(() => {
    navigate({
      pathname: `/${UserFlow.SignIn}/password`,
    });
  }, [navigate]);

  const {
    errorMessage,
    clearErrorMessage,
    onSubmit: sendVerificationCode,
  } = useSendVerificationCode(UserFlow.SignIn);

  const onSubmit = useCallback(
    async (identifier: SignInIdentifier, value: string) => {
      const method = signInMethods.find((method) => method.identifier === identifier);

      if (!method) {
        throw new Error(`Cannot find method with identifier type ${identifier}`);
      }

      setIdentifierInputValue({ type: identifier, value });

      const { password, isPasswordPrimary, verificationCode } = method;

      // Check if the email is registered with any SSO connectors. If the email is registered with any SSO connectors, we should not proceed to the next step
      if (identifier === SignInIdentifier.Email && ssoConnectors.length > 0) {
        const result = await checkSingleSignOn(value);

        if (result) {
          return;
        }
      }

      // Try passkey sign-in first if enabled
      // If the user has no passkeys, fall back to password/verification code
      if (passkeySignIn?.enabled) {
        const passkeySucceeded = await startIdentifierPasskeySignInProcessing({
          type: identifier,
          value,
        });

        if (passkeySucceeded) {
          return;
        }
        // User has no passkeys, continue with other methods
      }

      if (identifier === SignInIdentifier.Username) {
        navigateToPasswordPage();

        return;
      }

      if (password && (isPasswordPrimary || !verificationCode)) {
        navigateToPasswordPage();

        return;
      }

      if (verificationCode) {
        await sendVerificationCode(
          { identifier, value },
          undefined,
          // The email service usage cap blocks the code send. If this method also allows password
          // sign-in, route to the password page instead of stranding the user on the identifier
          // page with no way forward.
          conditional(
            password && {
              'connector.usage_limit_exceeded': () => {
                setToast(t('error.send_verification_code_failed_use_password'));
                navigateToPasswordPage();
              },
            }
          )
        );
      }
    },
    [
      signInMethods,
      setIdentifierInputValue,
      ssoConnectors.length,
      passkeySignIn?.enabled,
      checkSingleSignOn,
      startIdentifierPasskeySignInProcessing,
      navigateToPasswordPage,
      sendVerificationCode,
      setToast,
      t,
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useOnSubmit;
