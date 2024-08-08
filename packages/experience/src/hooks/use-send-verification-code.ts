/* Replace legacy useSendVerificationCode hook with this one after the refactor */

import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendVerificationCodeApi } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import {
  UserFlow,
  type ContinueFlowInteractionEvent,
  type VerificationCodeIdentifier,
} from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

const useSendVerificationCode = (flow: UserFlow, replaceCurrentPage?: boolean) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  const handleError = useErrorHandler();
  const asyncSendVerificationCode = useApi(sendVerificationCodeApi);
  const { setVerificationId } = useContext(UserInteractionContext);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  type Payload = {
    identifier: VerificationCodeIdentifier;
    value: string;
  };

  const onSubmit = useCallback(
    async ({ identifier, value }: Payload, interactionEvent?: ContinueFlowInteractionEvent) => {
      const [error, result] = await asyncSendVerificationCode(
        flow,
        {
          type: identifier,
          value,
        },
        interactionEvent
      );

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
        // Store the verification ID in the context so that we can use it in the next step
        setVerificationId(codeVerificationTypeMap[identifier], result.verificationId);

        navigate(
          {
            pathname: `/${flow}/verification-code`,
            search: window.location.search,
          },
          {
            replace: replaceCurrentPage,
            // Append the interaction event to the state so that we can use it in the next step
            ...conditional(
              flow === UserFlow.Continue && {
                state: { interactionEvent },
              }
            ),
          }
        );
      }
    },
    [asyncSendVerificationCode, flow, handleError, navigate, replaceCurrentPage, setVerificationId]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSendVerificationCode;
