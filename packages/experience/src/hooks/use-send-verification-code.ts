/* Replace legacy useSendVerificationCode hook with this one after the refactor */

import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';

import CaptchaContext from '@/Providers/CaptchaContextProvider/CaptchaContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendVerificationCodeApi } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import {
  UserFlow,
  type ContinueFlowInteractionEvent,
  type VerificationCodeIdentifier,
} from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

type Payload = {
  identifier: VerificationCodeIdentifier;
  value: string;
};

const useSendVerificationCode = (flow: UserFlow, replaceCurrentPage?: boolean) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigateWithPreservedSearchParams();
  const { executeCaptcha } = useContext(CaptchaContext);

  const handleError = useErrorHandler();
  const asyncSendVerificationCode = useApi(sendVerificationCodeApi);
  const { setVerificationId } = useContext(UserInteractionContext);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const onSubmit = useCallback(
    async ({ identifier, value }: Payload, interactionEvent?: ContinueFlowInteractionEvent) => {
      const captchaToken = await executeCaptcha();

      const [error, result] = await asyncSendVerificationCode(
        flow,
        {
          type: identifier,
          value,
        },
        interactionEvent,
        captchaToken
      );

      if (error) {
        await handleError(error, {
          'guard.invalid_input': () => {
            setErrorMessage(
              identifier === SignInIdentifier.Email ? 'invalid_email' : 'invalid_phone'
            );
          },
          'session.email_blocklist.email_not_allowed': (error) => {
            setErrorMessage(error.message);
          },
          'session.email_blocklist.email_subaddressing_not_allowed': (error) => {
            setErrorMessage(error.message);
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
    [
      asyncSendVerificationCode,
      flow,
      handleError,
      navigate,
      replaceCurrentPage,
      setVerificationId,
      executeCaptcha,
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSendVerificationCode;
