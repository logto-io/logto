import type { VerificationCodeIdentifier } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { identifyWithVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import { UserFlow } from '@/types';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';

const useForgotPasswordFlowCodeVerification = (
  identifier: VerificationCodeIdentifier,
  verificationId: string,
  errorCallback?: () => void
) => {
  const navigate = useNavigate();
  const handleError = useErrorHandler();
  const verifyVerificationCode = useApi(identifyWithVerificationCode);

  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();
  const identifierErrorHandler = useIdentifierErrorAlert();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.user_not_exist': async () =>
        identifierErrorHandler(
          IdentifierErrorType.IdentifierNotExist,
          identifier.type,
          identifier.value
        ),
      'user.new_password_required_in_profile': () => {
        navigate(`/${UserFlow.ForgotPassword}/reset`, { replace: true });
      },
      ...generalVerificationCodeErrorHandlers,
    }),
    [
      generalVerificationCodeErrorHandlers,
      identifierErrorHandler,
      identifier.type,
      identifier.value,
      navigate,
    ]
  );

  const onSubmit = useCallback(
    async (code: string) => {
      const [error, result] = await verifyVerificationCode({
        code,
        identifier,
        verificationId,
      });

      if (error) {
        await handleError(error, errorHandlers);
        errorCallback?.();

        return;
      }

      if (result) {
        navigate(`/${UserFlow.SignIn}`, { replace: true });
      }
    },
    [
      errorCallback,
      errorHandlers,
      handleError,
      identifier,
      navigate,
      verificationId,
      verifyVerificationCode,
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useForgotPasswordFlowCodeVerification;
