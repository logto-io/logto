import { MfaFactor } from '@logto/schemas';
import { useCallback, useContext, useState } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendMfaVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { type VerificationCodeIdentifier } from '@/types';
import { type MfaFlowState } from '@/types/guard';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

type Options = {
  /** Whether to replace the current page in the history stack on navigation. */
  replace?: boolean;
  /** Handlers for the errors of sending the code, on top of the default toast. */
  errorHandlers?: ErrorHandlers;
};

const useSendMfaVerificationCode = ({ replace, errorHandlers }: Options = {}) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigateWithPreservedSearchParams();

  const handleError = useErrorHandler();
  const asyncSendVerificationCode = useApi(sendMfaVerificationCode);
  const { setVerificationId } = useContext(UserInteractionContext);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const onSubmit = useCallback(
    async (identifier: VerificationCodeIdentifier, flowState: MfaFlowState) => {
      const [error, result] = await asyncSendVerificationCode(identifier);

      if (error) {
        await handleError(error, errorHandlers);

        return;
      }

      if (result) {
        // Store the verification ID in the context so that we can use it in the next step
        setVerificationId(codeVerificationTypeMap[identifier], result.verificationId);

        navigate(
          `/mfa-verification/${identifier === 'email' ? MfaFactor.EmailVerificationCode : MfaFactor.PhoneVerificationCode}`,
          { replace, state: flowState }
        );
      }
    },
    [asyncSendVerificationCode, errorHandlers, handleError, navigate, replace, setVerificationId]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSendMfaVerificationCode;
