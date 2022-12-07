import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { verifyForgotPasswordEmailPasscode } from '@/apis/forgot-password';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { UserFlow } from '@/types';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useForgotPasswordEmailPasscodeValidation = (email: string, errorCallback?: () => void) => {
  const navigate = useNavigate();
  const { sharedErrorHandlers, errorMessage, clearErrorMessage } = useSharedErrorHandler();

  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.forgotPassword,
    SignInIdentifier.Email,
    email
  );

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.email_not_exist': identifierNotExistErrorHandler,
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [identifierNotExistErrorHandler, sharedErrorHandlers, errorCallback]
  );

  const { result, run: verifyPasscode } = useApi(verifyForgotPasswordEmailPasscode, errorHandlers);

  const onSubmit = useCallback(
    async (code: string) => {
      return verifyPasscode(email, code);
    },
    [email, verifyPasscode]
  );

  useEffect(() => {
    if (result) {
      navigate(`/${UserFlow.forgotPassword}/reset`, { replace: true });
    }
  }, [navigate, result]);

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useForgotPasswordEmailPasscodeValidation;
