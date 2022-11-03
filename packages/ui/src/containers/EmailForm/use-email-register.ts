import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { sendRegisterEmailPasscode } from '@/apis/register';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { UserFlow } from '@/types';

const useEmailRegister = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'guard.invalid_input': () => {
        setErrorMessage('invalid_email');
      },
    }),
    []
  );

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const { run: asyncSendRegisterEmailPasscode } = useApi(sendRegisterEmailPasscode, errorHandlers);

  const onSubmit = useCallback(
    async (email: string) => {
      const result = await asyncSendRegisterEmailPasscode(email);

      if (!result) {
        return;
      }

      navigate(
        {
          pathname: `/${UserFlow.register}/${SignInIdentifier.Email}/passcode-validation`,
          search: location.search,
        },
        { state: { email } }
      );
    },
    [asyncSendRegisterEmailPasscode, navigate]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useEmailRegister;
