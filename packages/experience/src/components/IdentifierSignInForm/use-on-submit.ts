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
/* TE:BEGIN qr-push-factor */
import { hasTeDevices } from '@/te/api';
import useTePushEnabled from '@/te/use-te-push-enabled';
/* TE:END qr-push-factor */
import { UserFlow } from '@/types';

const useOnSubmit = (signInMethods: SignIn['methods']) => {
  const navigate = useNavigateWithPreservedSearchParams();
  const { setToast } = useToast();
  /* TE:BEGIN qr-push-factor */
  const isTePushEnabled = useTePushEnabled();
  /* TE:END qr-push-factor */
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

      /* TE:BEGIN qr-push-factor */
      // A TripleEnable account can verify in more than one way, so let the user choose
      // instead of dropping them into whichever factor happens to be primary.
      if (isTePushEnabled && (await hasTeDevices(value))) {
        navigate({ pathname: `/${UserFlow.SignIn}/verification-methods` });

        return;
      }
      /* TE:END qr-push-factor */

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
      /* TE:BEGIN qr-push-factor */
      isTePushEnabled,
      navigate,
      /* TE:END qr-push-factor */
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useOnSubmit;
