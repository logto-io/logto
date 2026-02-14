import { useState, useCallback, useEffect } from 'react';

import useSendVerificationCode from '@/hooks/use-send-verification-code';
import useToast from '@/hooks/use-toast';
import { UserFlow } from '@/types';

const useVerificationCodeLink = () => {
  const { setToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { errorMessage, clearErrorMessage, onSubmit } = useSendVerificationCode(
    UserFlow.SignIn,
    true
  );

  useEffect(() => {
    if (errorMessage) {
      setToast(errorMessage);
    }
  }, [errorMessage, setToast]);

  return useCallback(
    async (...args: Parameters<typeof onSubmit>) => {
      if (isLoading) {
        return;
      }

      clearErrorMessage();
      setIsLoading(true);
      await onSubmit(...args);
      setIsLoading(false);
    },
    [clearErrorMessage, isLoading, onSubmit]
  );
};

export default useVerificationCodeLink;
