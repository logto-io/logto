import { useState, useMemo, useCallback } from 'react';

import type { PasswordSignInPayload } from '@/apis/interaction';
import { signInWithPasswordIdentifier } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';

import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';

const usePasswordSignIn = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const handleError = useErrorHandler();
  const asyncSignIn = useApi(signInWithPasswordIdentifier);
  const preSignInErrorHandler = usePreSignInErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.invalid_credentials': (error) => {
        setErrorMessage(error.message);
      },
      ...preSignInErrorHandler,
    }),
    [preSignInErrorHandler]
  );

  const onSubmit = useCallback(
    async (payload: PasswordSignInPayload) => {
      const [error, result] = await asyncSignIn(payload);

      if (error) {
        await handleError(error, errorHandlers);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncSignIn, errorHandlers, handleError]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default usePasswordSignIn;
