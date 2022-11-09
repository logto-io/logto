import { SignInIdentifier } from '@logto/schemas';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { checkUsername } from '@/apis/register';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-api';
import { UserFlow } from '@/types';

const useUsernameRegister = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_exists_register': (error) => {
        setErrorMessage(error.message);
      },
    }),
    []
  );

  const { run: asyncCheckUsername } = useApi(checkUsername, errorHandlers);

  const onSubmit = useCallback(
    async (username: string) => {
      const result = await asyncCheckUsername(username);

      if (result) {
        navigate(`/${UserFlow.register}/${SignInIdentifier.Username}/password`, {
          state: { username },
        });
      }
    },
    [asyncCheckUsername, navigate]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useUsernameRegister;
