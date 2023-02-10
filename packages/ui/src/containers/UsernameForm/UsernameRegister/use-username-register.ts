import { SignInIdentifier } from '@logto/schemas';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerWithUsernamePassword } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import { UserFlow } from '@/types';

const useUsernameRegister = () => {
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
      'user.missing_profile': () => {
        navigate(`/${UserFlow.register}/${SignInIdentifier.Username}/password`);
      },
    }),
    [navigate]
  );

  const handleError = useErrorHandler();
  const asyncRegister = useApi(registerWithUsernamePassword);

  const onSubmit = useCallback(
    async (username: string) => {
      const [error] = await asyncRegister(username);

      if (error) {
        await handleError(error, errorHandlers);
      }
    },
    [asyncRegister, errorHandlers, handleError]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useUsernameRegister;
