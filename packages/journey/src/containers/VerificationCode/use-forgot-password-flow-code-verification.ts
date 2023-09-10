import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { verifyForgotPasswordVerificationCodeIdentifier } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import type { VerificationCodeIdentifier } from '@/types';
import { UserFlow } from '@/types';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';

const useForgotPasswordFlowCodeVerification = (
  method: VerificationCodeIdentifier,
  target: string,
  errorCallback?: () => void
) => {
  const navigate = useNavigate();
  const handleError = useErrorHandler();
  const verifyVerificationCode = useApi(verifyForgotPasswordVerificationCodeIdentifier);

  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();
  const identifierErrorHandler = useIdentifierErrorAlert();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.user_not_exist': async () =>
        identifierErrorHandler(IdentifierErrorType.IdentifierNotExist, method, target),
      'user.new_password_required_in_profile': () => {
        navigate(`/${UserFlow.ForgotPassword}/reset`, { replace: true });
      },
      ...generalVerificationCodeErrorHandlers,
    }),
    [generalVerificationCodeErrorHandlers, identifierErrorHandler, method, target, navigate]
  );

  const onSubmit = useCallback(
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      const [error, result] = await verifyVerificationCode(payload);

      if (error) {
        await handleError(error, errorHandlers);
        errorCallback?.();

        return;
      }

      if (result) {
        navigate(`/${UserFlow.SignIn}`, { replace: true });
      }
    },
    [errorCallback, errorHandlers, handleError, navigate, verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useForgotPasswordFlowCodeVerification;
