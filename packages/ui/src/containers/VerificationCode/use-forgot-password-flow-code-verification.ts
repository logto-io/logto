import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { verifyForgotPasswordVerificationCodeIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
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
  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();

  const identifierErrorHandler = useIdentifierErrorAlert();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.user_not_exist': async () =>
        identifierErrorHandler(IdentifierErrorType.IdentifierNotExist, method, target),
      'user.new_password_required_in_profile': () => {
        navigate(`/${UserFlow.forgotPassword}/reset`, { replace: true });
      },
      ...generalVerificationCodeErrorHandlers,
      callback: errorCallback,
    }),
    [
      generalVerificationCodeErrorHandlers,
      errorCallback,
      identifierErrorHandler,
      method,
      target,
      navigate,
    ]
  );

  const { result, run: verifyVerificationCode } = useApi(
    verifyForgotPasswordVerificationCodeIdentifier,
    errorHandlers
  );

  const onSubmit = useCallback(
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      return verifyVerificationCode(payload);
    },
    [verifyVerificationCode]
  );

  useEffect(() => {
    if (result) {
      navigate(`/${UserFlow.signIn}`, { replace: true });
    }
  }, [navigate, result]);

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useForgotPasswordFlowCodeVerification;
