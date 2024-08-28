import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import useCheckSingleSignOn from '@/hooks/use-check-single-sign-on';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import { useSieMethods } from '@/hooks/use-sie';
import { UserFlow } from '@/types';

const useOnSubmit = (signInMethods: SignIn['methods']) => {
  const navigate = useNavigate();
  const { ssoConnectors } = useSieMethods();
  const { onSubmit: checkSingleSignOn } = useCheckSingleSignOn();

  const signInWithPassword = useCallback(
    (identifier: SignInIdentifier, value: string) => {
      navigate(
        {
          pathname: `/${UserFlow.SignIn}/password`,
        },
        { state: { identifier, value } }
      );
    },
    [navigate]
  );

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

      const { password, isPasswordPrimary, verificationCode } = method;

      if (identifier === SignInIdentifier.Username) {
        signInWithPassword(identifier, value);

        return;
      }

      // Check if the email is registered with any SSO connectors. If the email is registered with any SSO connectors, we should not proceed to the next step
      if (identifier === SignInIdentifier.Email && ssoConnectors.length > 0) {
        const result = await checkSingleSignOn(value);

        if (result) {
          return;
        }
      }

      if (password && (isPasswordPrimary || !verificationCode)) {
        signInWithPassword(identifier, value);

        return;
      }

      if (verificationCode) {
        await sendVerificationCode({ identifier, value });
      }
    },
    [
      checkSingleSignOn,
      sendVerificationCode,
      signInMethods,
      signInWithPassword,
      ssoConnectors.length,
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useOnSubmit;
