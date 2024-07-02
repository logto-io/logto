import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import useCheckSingleSignOn from '@/hooks/use-check-single-sign-on';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import { useSieMethods } from '@/hooks/use-sie';
import { UserFlow } from '@/types';

import useRegisterWithUsername from './use-register-with-username';

const useOnSubmit = () => {
  const { ssoConnectors } = useSieMethods();
  const { onSubmit: checkSingleSignOn } = useCheckSingleSignOn();
  const { setCurrentIdentifier } = useContext(UserInteractionContext);

  const {
    errorMessage: usernameRegisterErrorMessage,
    clearErrorMessage: clearUsernameRegisterErrorMessage,
    onSubmit: registerWithUsername,
  } = useRegisterWithUsername();

  const {
    errorMessage: sendVerificationCodeErrorMessage,
    clearErrorMessage: clearSendVerificationCodeErrorMessage,
    onSubmit: sendVerificationCode,
  } = useSendVerificationCode(UserFlow.Register);

  const clearErrorMessage = useCallback(() => {
    clearUsernameRegisterErrorMessage();
    clearSendVerificationCodeErrorMessage();
  }, [clearSendVerificationCodeErrorMessage, clearUsernameRegisterErrorMessage]);

  const onSubmit = useCallback(
    async (identifier: SignInIdentifier, value: string) => {
      setCurrentIdentifier({ type: identifier, value });

      if (identifier === SignInIdentifier.Username) {
        await registerWithUsername(value);

        return;
      }

      // Check if the email is registered with any SSO connectors. If the email is registered with any SSO connectors, we should not proceed to the next step
      if (identifier === SignInIdentifier.Email && ssoConnectors.length > 0) {
        const result = await checkSingleSignOn(value);

        if (result) {
          return;
        }
      }

      await sendVerificationCode({ identifier, value });
    },
    [
      checkSingleSignOn,
      registerWithUsername,
      sendVerificationCode,
      setCurrentIdentifier,
      ssoConnectors.length,
    ]
  );

  return {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    errorMessage: usernameRegisterErrorMessage || sendVerificationCodeErrorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useOnSubmit;
