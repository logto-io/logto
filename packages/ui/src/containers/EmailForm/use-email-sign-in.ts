import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { sendSignInEmailPasscode } from '@/apis/sign-in';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import type { ArrayElement } from '@/types';
import { UserFlow } from '@/types';

export type MethodProps = ArrayElement<SignIn['methods']>;

const useEmailSignIn = ({ password, isPasswordPrimary, verificationCode }: MethodProps) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'guard.invalid_input': () => {
        setErrorMessage('invalid_email');
      },
    }),
    [setErrorMessage]
  );

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const { run: asyncSendSignInEmailPasscode } = useApi(sendSignInEmailPasscode, errorHandlers);

  const navigateToPasswordPage = useCallback(
    (email: string) => {
      navigate(
        {
          pathname: `/${UserFlow.signIn}/${SignInIdentifier.Email}/password`,
          search: location.search,
        },
        { state: { email } }
      );
    },
    [navigate]
  );

  const sendPasscode = useCallback(
    async (email: string) => {
      const result = await asyncSendSignInEmailPasscode(email);

      if (!result) {
        return;
      }

      navigate(
        {
          pathname: `/${UserFlow.signIn}/${SignInIdentifier.Email}/passcode-validation`,
          search: location.search,
        },
        { state: { email } }
      );
    },
    [asyncSendSignInEmailPasscode, navigate]
  );

  const onSubmit = useCallback(
    async (email: string) => {
      // Email Password SignIn Flow
      if (password && (isPasswordPrimary || !verificationCode)) {
        navigateToPasswordPage(email);

        return;
      }

      // Email Passwordless SignIn Flow
      if (verificationCode) {
        await sendPasscode(email);
      }
    },
    [isPasswordPrimary, navigateToPasswordPage, password, sendPasscode, verificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useEmailSignIn;
