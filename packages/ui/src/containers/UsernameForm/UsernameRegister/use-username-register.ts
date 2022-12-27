import { SignInIdentifier } from '@logto/schemas';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerWithUsernamePassword } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
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

  const { run: asyncRegister } = useApi(registerWithUsernamePassword, errorHandlers);

  const onSubmit = useCallback(
    async (username: string) => {
      await asyncRegister(username);
    },
    [asyncRegister]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useUsernameRegister;
