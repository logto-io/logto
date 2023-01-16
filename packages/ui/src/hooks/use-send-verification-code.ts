import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getSendVerificationCodeApi } from '@/apis/utils';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import type { UserFlow } from '@/types';

const useSendVerificationCode = <T extends SignInIdentifier.Email | SignInIdentifier.Phone>(
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

  const api = getSendVerificationCodeApi(flow);

  const { run: asyncSendVerificationCode } = useApi(api, errorHandlers);

  type Payload = T extends SignInIdentifier.Email ? { email: string } : { phone: string };

  const onSubmit = useCallback(
    async (payload: Payload) => {
      const result = await asyncSendVerificationCode(payload);

      if (!result) {
        return;
      }

      navigate(
        {
          pathname: `/${flow}/${method}/verification-code`,
        },
        {
          state: payload,
          replace: replaceCurrentPage,
        }
      );
    },
    [asyncSendVerificationCode, flow, method, navigate, replaceCurrentPage]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSendVerificationCode;
