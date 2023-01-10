import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  addProfileWithVerificationCodeIdentifier,
  signInWithVerifierIdentifier,
} from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { useSieMethods } from '@/hooks/use-sie';

import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useRegisterWithEmailVerificationCode = (email: string, errorCallback?: () => void) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { errorMessage, clearErrorMessage, sharedErrorHandlers } = useSharedErrorHandler();

  const { signInMode } = useSieMethods();

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler(true);

  const { run: signInWithEmailAsync } = useApi(
    signInWithVerifierIdentifier,
    requiredProfileErrorHandlers
  );

  const identifierExistErrorHandler = useIdentifierErrorAlert(
    IdentifierErrorType.IdentifierAlreadyExists,
    SignInIdentifier.Email,
    email
  );

  const emailExistSignInErrorHandler = useCallback(async () => {
    const [confirm] = await show({
      confirmText: 'action.sign_in',
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.email`),
        value: email,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await signInWithEmailAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [email, navigate, show, signInWithEmailAsync, t]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.email_already_in_use':
        signInMode === SignInMode.Register
          ? identifierExistErrorHandler
          : emailExistSignInErrorHandler,
      ...sharedErrorHandlers,
      ...requiredProfileErrorHandlers,
      callback: errorCallback,
    }),
    [
      emailExistSignInErrorHandler,
      errorCallback,
      identifierExistErrorHandler,
      requiredProfileErrorHandlers,
      sharedErrorHandlers,
      signInMode,
    ]
  );

  const { result, run: verifyVerificationCode } = useApi(
    addProfileWithVerificationCodeIdentifier,
    errorHandlers
  );

  const onSubmit = useCallback(
    async (verificationCode: string) => {
      return verifyVerificationCode({ email, verificationCode });
    },
    [email, verifyVerificationCode]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useRegisterWithEmailVerificationCode;
