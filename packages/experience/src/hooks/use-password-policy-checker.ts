import { useCallback } from 'react';

import usePasswordErrorMessage from './use-password-error-message';
import { usePasswordPolicy } from './use-sie';

type Options = {
  setErrorMessage: (message?: string) => void;
};

const usePasswordPolicyChecker = ({ setErrorMessage }: Options) => {
  const { getErrorMessage } = usePasswordErrorMessage();
  const { policyChecker } = usePasswordPolicy();

  const checkPassword = useCallback(
    async (password: string) => {
      // Perform fast check before sending request
      const fastCheckErrorMessage = getErrorMessage(policyChecker.fastCheck(password));

      if (fastCheckErrorMessage) {
        setErrorMessage(fastCheckErrorMessage);
        return false;
      }

      return true;
    },
    [getErrorMessage, policyChecker, setErrorMessage]
  );

  return checkPassword;
};

export default usePasswordPolicyChecker;
