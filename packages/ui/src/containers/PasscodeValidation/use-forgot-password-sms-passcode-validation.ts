import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { verifyForgotPasswordSmsPasscode } from '@/apis/forgot-password';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { UserFlow } from '@/types';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useForgotPasswordSmsPasscodeValidation = (phone: string, errorCallback?: () => void) => {
  const navigate = useNavigate();
  const { sharedErrorHandlers, errorMessage, clearErrorMessage } = useSharedErrorHandler();
  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.forgotPassword,
    SignInIdentifier.Sms,
    phone
  );

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_not_exist': identifierNotExistErrorHandler,
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [sharedErrorHandlers, errorCallback, identifierNotExistErrorHandler]
  );

  const { result, run: verifyPasscode } = useApi(verifyForgotPasswordSmsPasscode, errorHandlers);

  const onSubmit = useCallback(
    async (code: string) => {
      return verifyPasscode(phone, code);
    },
    [phone, verifyPasscode]
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

export default useForgotPasswordSmsPasscodeValidation;
