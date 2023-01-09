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
import { UserFlow } from '@/types';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useRegisterWithPhoneVerificationCode = (phone: string, errorCallback?: () => void) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { errorMessage, clearErrorMessage, sharedErrorHandlers } = useSharedErrorHandler();
  const { signInMode } = useSieMethods();

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler(true);

  const { run: signInWithPhoneAsync } = useApi(
    signInWithVerifierIdentifier,
    requiredProfileErrorHandlers
  );

  const identifierExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.register,
    SignInIdentifier.Phone,
    formatPhoneNumberWithCountryCallingCode(phone)
  );

  const phoneExistSignInErrorHandler = useCallback(async () => {
    const [confirm] = await show({
      confirmText: 'action.sign_in',
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.phone_number`),
        value: phone,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await signInWithPhoneAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [phone, navigate, show, signInWithPhoneAsync, t]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.phone_already_in_use':
        signInMode === SignInMode.Register
          ? identifierExistErrorHandler
          : phoneExistSignInErrorHandler,
      ...sharedErrorHandlers,
      ...requiredProfileErrorHandlers,
      callback: errorCallback,
    }),
    [
      signInMode,
      identifierExistErrorHandler,
      phoneExistSignInErrorHandler,
      sharedErrorHandlers,
      requiredProfileErrorHandlers,
      errorCallback,
    ]
  );

  const { result, run: verifyVerificationCode } = useApi(
    addProfileWithVerificationCodeIdentifier,
    errorHandlers
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  const onSubmit = useCallback(
    async (verificationCode: string) => {
      return verifyVerificationCode({
        phone,
        verificationCode,
      });
    },
    [phone, verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useRegisterWithPhoneVerificationCode;
