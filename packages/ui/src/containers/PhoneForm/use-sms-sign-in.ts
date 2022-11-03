import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { sendSignInSmsPasscode } from '@/apis/sign-in';
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
        setErrorMessage('invalid_phone');
      },
    }),
    []
  );

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const { run: asyncSendSignInEmailPasscode } = useApi(sendSignInSmsPasscode, errorHandlers);

  const navigateToPasswordPage = useCallback(
    (phone: string) => {
      navigate(
        {
          pathname: `/${UserFlow.signIn}/${SignInIdentifier.Sms}/password`,
          search: location.search,
        },
        { state: { phone } }
      );
    },
    [navigate]
  );

  const sendPasscode = useCallback(
    async (phone: string) => {
      const result = await asyncSendSignInEmailPasscode(phone);

      if (!result) {
        return;
      }

      navigate(
        {
          pathname: `/${UserFlow.signIn}/${SignInIdentifier.Sms}/passcode-validation`,
          search: location.search,
        },
        { state: { phone } }
      );
    },
    [asyncSendSignInEmailPasscode, navigate]
  );

  const onSubmit = useCallback(
    async (phone: string) => {
      // Sms Password SignIn Flow
      if (password && (isPasswordPrimary || !verificationCode)) {
        navigateToPasswordPage(phone);

        return;
      }

      // Sms Passwordless SignIn Flow
      if (verificationCode) {
        await sendPasscode(phone);
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
