import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  signInWithVerificationCodeIdentifier,
  registerWithVerifiedIdentifier,
} from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useSignInWithPhoneVerificationCode = (phone: string, errorCallback?: () => void) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { errorMessage, clearErrorMessage, sharedErrorHandlers } = useSharedErrorHandler();

  const { signInMode } = useSieMethods();

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler(true);

  const { run: registerWithPhoneAsync } = useApi(
    registerWithVerifiedIdentifier,
    requiredProfileErrorHandlers
  );

  const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    IdentifierErrorType.IdentifierNotExist,
    SignInIdentifier.Phone,
    phone
  );

  const phoneNotExistRegisterErrorHandler = useCallback(async () => {
    const [confirm] = await show({
      confirmText: 'action.create',
      ModalContent: t('description.sign_in_id_does_not_exist', {
        type: t(`description.phone_number`),
        value: phone,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await registerWithPhoneAsync({ phone });

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [phone, navigate, show, registerWithPhoneAsync, t]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.user_not_exist':
        // Block user auto register if is bind social or sign-in only flow
        signInMode === SignInMode.SignIn || socialToBind
          ? identifierNotExistErrorHandler
          : phoneNotExistRegisterErrorHandler,
      ...sharedErrorHandlers,
      ...requiredProfileErrorHandlers,
      callback: errorCallback,
    }),
    [
      signInMode,
      socialToBind,
      identifierNotExistErrorHandler,
      phoneNotExistRegisterErrorHandler,
      sharedErrorHandlers,
      requiredProfileErrorHandlers,
      errorCallback,
    ]
  );

  const { result, run: asyncSignInWithVerificationCodeIdentifier } = useApi(
    signInWithVerificationCodeIdentifier,
    errorHandlers
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  const onSubmit = useCallback(
    async (verificationCode: string) => {
      return asyncSignInWithVerificationCodeIdentifier(
        {
          phone,
          verificationCode,
        },
        socialToBind
      );
    },
    [phone, socialToBind, asyncSignInWithVerificationCodeIdentifier]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSignInWithPhoneVerificationCode;
