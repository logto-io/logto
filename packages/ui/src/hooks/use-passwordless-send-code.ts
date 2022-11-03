import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import type { UserFlow } from '@/types';

const usePasswordlessSendCode = (
  flow: UserFlow,
  method: SignInIdentifier.Email | SignInIdentifier.Sms
) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'guard.invalid_input': () => {
        setErrorMessage(method === SignInIdentifier.Email ? 'invalid_email' : 'invalid_phone');
      },
    }),
    [method]
  );

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const api = getSendPasscodeApi(flow, method);

  const { run: asyncSendPasscode } = useApi(api, errorHandlers);

  const onSubmit = useCallback(
    async (value: string) => {
      const result = await asyncSendPasscode(value);

      if (!result) {
        return;
      }

      navigate(
        {
          pathname: `/${flow}/${method}/passcode-validation`,
          search: location.search,
        },
        { state: method === SignInIdentifier.Email ? { email: value } : { phone: value } }
      );
    },
    [asyncSendPasscode, flow, method, navigate]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default usePasswordlessSendCode;
