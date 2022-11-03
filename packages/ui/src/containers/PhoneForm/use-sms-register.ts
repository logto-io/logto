import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { sendRegisterSmsPasscode } from '@/apis/register';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { UserFlow } from '@/types';

const useSmsRegister = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'guard.invalid_input': () => {
        setErrorMessage('invalid_phone');
      },
    }),
    []
  );

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const { run: asyncSendRegisterSmsPasscode } = useApi(sendRegisterSmsPasscode, errorHandlers);

  const onSubmit = useCallback(
    async (phone: string) => {
      const result = await asyncSendRegisterSmsPasscode(phone);

      if (!result) {
        return;
      }

      navigate(
        {
          pathname: `/${UserFlow.register}/${SignInIdentifier.Sms}/passcode-validation`,
          search: location.search,
        },
        { state: { phone } }
      );
    },
    [asyncSendRegisterSmsPasscode, navigate]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSmsRegister;
