import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { identifyAndSubmitInteraction, registerWithUsername } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import { useSieMethods } from '@/hooks/use-sie';

const useRegisterWithUsername = () => {
  const navigate = useNavigate();
  const redirectTo = useGlobalRedirectTo();

  const [errorMessage, setErrorMessage] = useState<string>();

  const { passwordRequiredForSignUp } = useSieMethods();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const usernameErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_already_in_use': (error) => {
        setErrorMessage(error.message);
      },
    }),
    []
  );

  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

  const handleError = useErrorHandler();
  const asyncRegister = useApi(registerWithUsername);

  const asyncSubmitInteraction = useApi(identifyAndSubmitInteraction);

  const onSubmitInteraction = useCallback(async () => {
    const [error, result] = await asyncSubmitInteraction();

    if (error) {
      await handleError(error, preSignInErrorHandler);
      return;
    }

    if (result) {
      await redirectTo(result.redirectTo);
    }
  }, [asyncSubmitInteraction, handleError, preSignInErrorHandler, redirectTo]);

  const onSubmit = useCallback(
    async (username: string) => {
      const [error] = await asyncRegister(username);

      if (error) {
        await handleError(error, usernameErrorHandlers);
        return;
      }

      // If password is required for sign up, navigate to the password page
      if (passwordRequiredForSignUp) {
        navigate('password');
        return;
      }

      // Otherwise, identify and submit interaction
      await onSubmitInteraction();
    },
    [
      asyncRegister,
      passwordRequiredForSignUp,
      onSubmitInteraction,
      handleError,
      usernameErrorHandlers,
      navigate,
    ]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useRegisterWithUsername;
