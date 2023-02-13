import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  addProfileWithVerificationCodeIdentifier,
  signInWithVerifiedIdentifier,
} from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import type { VerificationCodeIdentifier } from '@/types';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';

const useRegisterFlowCodeVerification = (
  method: VerificationCodeIdentifier,
  target: string,
  errorCallback?: () => void
) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();

  const { signInMode } = useSieMethods();

  const handleError = useErrorHandler();
  const signInWithIdentifierAsync = useApi(signInWithVerifiedIdentifier);
  const verifyVerificationCode = useApi(addProfileWithVerificationCodeIdentifier);

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler({ replace: true });
  const showIdentifierErrorAlert = useIdentifierErrorAlert();
  const identifierExistErrorHandler = useCallback(async () => {
    // Should not redirect user to sign-in if is register-only mode
    if (signInMode === SignInMode.Register) {
      void showIdentifierErrorAlert(IdentifierErrorType.IdentifierAlreadyExists, method, target);

      return;
    }

    const [confirm] = await show({
      confirmText: 'action.sign_in',
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        value:
          method === SignInIdentifier.Phone
            ? formatPhoneNumberWithCountryCallingCode(target)
            : target,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const [error, result] = await signInWithIdentifierAsync();

    if (error) {
      await handleError(error, requiredProfileErrorHandlers);

      return;
    }

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [
    handleError,
    method,
    navigate,
    requiredProfileErrorHandlers,
    show,
    showIdentifierErrorAlert,
    signInMode,
    signInWithIdentifierAsync,
    t,
    target,
  ]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.email_already_in_use': identifierExistErrorHandler,
      'user.phone_already_in_use': identifierExistErrorHandler,
      ...generalVerificationCodeErrorHandlers,
      ...requiredProfileErrorHandlers,
      callback: errorCallback,
    }),
    [
      errorCallback,
      identifierExistErrorHandler,
      requiredProfileErrorHandlers,
      generalVerificationCodeErrorHandlers,
    ]
  );

  const onSubmit = useCallback(
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      const [error, result] = await verifyVerificationCode(payload);

      if (error) {
        await handleError(error, errorHandlers);
        errorCallback?.();

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [errorCallback, errorHandlers, handleError, verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useRegisterFlowCodeVerification;
