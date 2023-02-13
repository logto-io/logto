import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getSendVerificationCodeApi } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import type { UserFlow } from '@/types';

const useSendVerificationCode = <T extends SignInIdentifier.Email | SignInIdentifier.Phone>(
  flow: UserFlow,
  method: T,
  replaceCurrentPage?: boolean
) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  const handleError = useErrorHandler();
  const asyncSendVerificationCode = useApi(getSendVerificationCodeApi(flow));

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'guard.invalid_input': () => {
        setErrorMessage(method === SignInIdentifier.Email ? 'invalid_email' : 'invalid_phone');
      },
    }),
    [method]
  );

  type Payload = T extends SignInIdentifier.Email ? { email: string } : { phone: string };

  const onSubmit = useCallback(
    async (payload: Payload) => {
      const [error, result] = await asyncSendVerificationCode(payload);

      if (error) {
        await handleError(error, errorHandlers);

        return;
      }

      if (result) {
        navigate(
          {
            pathname: `/${flow}/${method}/verification-code`,
            search: location.search,
          },
          {
            state: payload,
            replace: replaceCurrentPage,
          }
        );
      }
    },
    [
      asyncSendVerificationCode,
      errorHandlers,
      flow,
      handleError,
      method,
      navigate,
      replaceCurrentPage,
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSendVerificationCode;
