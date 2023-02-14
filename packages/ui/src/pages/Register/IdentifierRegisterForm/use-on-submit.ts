import { SignInIdentifier } from '@logto/schemas';
import { useCallback } from 'react';

import useSendVerificationCode from '@/hooks/use-send-verification-code';
import { UserFlow } from '@/types';

import useRegisterWithUsername from './use-register-with-username';

// TODO: extract the errorMessage and clear method from useRegisterWithUsername and useSendVerificationCode

const useOnSubmit = () => {
  const {
    errorMessage: usernameRegisterErrorMessage,
    clearErrorMessage: clearUsernameRegisterErrorMessage,
    onSubmit: registerWithUsername,
  } = useRegisterWithUsername();

  const {
    errorMessage: sendVerificationCodeErrorMessage,
    clearErrorMessage: clearSendVerificationCodeErrorMessage,
    onSubmit: sendVerificationCode,
  } = useSendVerificationCode(UserFlow.register);

  const clearErrorMessage = useCallback(() => {
    clearUsernameRegisterErrorMessage();
    clearSendVerificationCodeErrorMessage();
  }, [clearSendVerificationCodeErrorMessage, clearUsernameRegisterErrorMessage]);

  const onSubmit = useCallback(
    async (identifier: SignInIdentifier, value: string) => {
      if (identifier === SignInIdentifier.Username) {
        await registerWithUsername(value);

        return;
      }

      await sendVerificationCode({ identifier, value });
    },
    [registerWithUsername, sendVerificationCode]
  );

  return {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    errorMessage: usernameRegisterErrorMessage || sendVerificationCodeErrorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useOnSubmit;
