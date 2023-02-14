/* Replace legacy useSendVerificationCode hook with this one after the refactor */

import { SignInIdentifier } from '@logto/schemas';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { sendVerificationCodeApi } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import type { VerificationCodeIdentifier } from '@/types';
import { UserFlow } from '@/types';

const useSendVerificationCode = (flow: UserFlow, replaceCurrentPage?: boolean) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  const handleError = useErrorHandler();
  const asyncSendVerificationCode = useApi(sendVerificationCodeApi);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  type Payload = {
    identifier: VerificationCodeIdentifier;
    value: string;
  };

  const onSubmit = useCallback(
    async ({ identifier, value }: Payload) => {
      const [error, result] = await asyncSendVerificationCode(UserFlow.signIn, {
        [identifier]: value,
      });

      if (error) {
        await handleError(error, {
          'guard.invalid_input': () => {
            setErrorMessage(
              identifier === SignInIdentifier.Email ? 'invalid_email' : 'invalid_phone'
            );
          },
        });

        return;
      }

      if (result) {
        navigate(
          {
            pathname: `verification-code`,
            search: location.search,
          },
          {
            state: { identifier, value },
            replace: replaceCurrentPage,
          }
        );
      }
    },
    [asyncSendVerificationCode, handleError, navigate, replaceCurrentPage]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSendVerificationCode;
