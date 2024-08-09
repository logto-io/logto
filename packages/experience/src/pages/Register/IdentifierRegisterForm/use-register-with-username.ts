import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerWithUsername } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';

const useRegisterWithUsername = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_already_in_use': (error) => {
        setErrorMessage(error.message);
      },
    }),
    []
  );

  const handleError = useErrorHandler();
  const asyncRegister = useApi(registerWithUsername);

  const onSubmit = useCallback(
    async (username: string) => {
      const [error] = await asyncRegister(username);

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      navigate('password');
    },
    [asyncRegister, errorHandlers, handleError, navigate]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useRegisterWithUsername;
