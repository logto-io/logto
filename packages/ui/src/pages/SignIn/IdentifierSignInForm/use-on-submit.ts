import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import useSendVerificationCode from '@/hooks/use-send-verification-code';
import { UserFlow } from '@/types';

const useOnSubmit = (signInMethods: SignIn['methods']) => {
  const navigate = useNavigate();

  const signInWithPassword = useCallback(
    (identifier: SignInIdentifier, value: string) => {
      navigate(
        {
          pathname: 'password',
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
  } = useSendVerificationCode(UserFlow.signIn);

  const onSubmit = async (identifier: SignInIdentifier, value: string) => {
    const method = signInMethods.find((method) => method.identifier === identifier);

    if (!method) {
      throw new Error(`Cannot find method with identifier type ${identifier}`);
    }

    const { password, isPasswordPrimary, verificationCode } = method;

    if (identifier === SignInIdentifier.Username) {
      signInWithPassword(identifier, value);

      return;
    }

    if (password && (isPasswordPrimary || !verificationCode)) {
      signInWithPassword(identifier, value);

      return;
    }

    if (verificationCode) {
      await sendVerificationCode({ identifier, value });
    }
  };

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useOnSubmit;
