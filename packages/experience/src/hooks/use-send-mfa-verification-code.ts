import { MfaFactor } from '@logto/schemas';
import { useCallback, useContext, useState } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendMfaVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { type VerificationCodeIdentifier } from '@/types';
import { type MfaFlowState } from '@/types/guard';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

const useSendMfaVerificationCode = () => {
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
        await handleError(error);

        return;
      }

      if (result) {
        // Store the verification ID in the context so that we can use it in the next step
        setVerificationId(codeVerificationTypeMap[identifier], result.verificationId);

        navigate(
          `/mfa-verification/${identifier === 'email' ? MfaFactor.EmailVerificationCode : MfaFactor.PhoneVerificationCode}`,
          { state: flowState }
        );
      }
    },
    [asyncSendVerificationCode, handleError, navigate, setVerificationId]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSendMfaVerificationCode;
