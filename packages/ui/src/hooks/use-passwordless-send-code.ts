import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import type { UserFlow } from '@/types';

const usePasswordlessSendCode = <T extends SignInIdentifier.Email | SignInIdentifier.Sms>(
  flow: UserFlow,
  method: T,
  replaceCurrentPage?: boolean
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

  const api = getSendPasscodeApi(flow);

  const { run: asyncSendPasscode } = useApi(api, errorHandlers);

  type Payload = T extends SignInIdentifier.Email ? { email: string } : { phone: string };

  const onSubmit = useCallback(
    async (payload: Payload) => {
      const result = await asyncSendPasscode(payload);

      if (!result) {
        return;
      }

      navigate(
        {
          pathname: `/${flow}/${method}/passcode-validation`,
          search: location.search,
        },
        {
          state: payload,
          replace: replaceCurrentPage,
        }
      );
    },
    [asyncSendPasscode, flow, method, navigate, replaceCurrentPage]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default usePasswordlessSendCode;
