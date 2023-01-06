import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { verifyForgotPasswordVerificationCodeIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { UserFlow } from '@/types';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useForgotPasswordEmailVerificationCode = (email: string, errorCallback?: () => void) => {
  const navigate = useNavigate();
  const { sharedErrorHandlers, errorMessage, clearErrorMessage } = useSharedErrorHandler();

  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.forgotPassword,
    SignInIdentifier.Email,
    email
  );

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.user_not_exist': identifierNotExistErrorHandler,
      'user.new_password_required_in_profile': () => {
        navigate(`/${UserFlow.forgotPassword}/reset`, { replace: true });
      },
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [identifierNotExistErrorHandler, sharedErrorHandlers, errorCallback, navigate]
  );

  const { result, run: verifyVerificationCode } = useApi(
    verifyForgotPasswordVerificationCodeIdentifier,
    errorHandlers
  );

  const onSubmit = useCallback(
    async (verificationCode: string) => {
      return verifyVerificationCode({ email, verificationCode });
    },
    [email, verifyVerificationCode]
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

export default useForgotPasswordEmailVerificationCode;
