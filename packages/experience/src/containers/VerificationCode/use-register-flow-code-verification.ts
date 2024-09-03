import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
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
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
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
  const redirectTo = useGlobalRedirectTo();

  const { signInMode } = useSieMethods();

  const handleError = useErrorHandler();
  const signInWithIdentifierAsync = useApi(signInWithVerifiedIdentifier);
  const verifyVerificationCode = useApi(addProfileWithVerificationCodeIdentifier);

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();
  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();
  const identifierExistErrorHandler = useCallback(async () => {
    // Should not redirect user to sign-in if is register-only mode
    if (signInMode === SignInMode.Register) {
      void showIdentifierErrorAlert(IdentifierErrorType.IdentifierAlreadyExists, method, target);

      return;
    }

    show({
      confirmText: 'action.sign_in',
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        value:
          method === SignInIdentifier.Phone
            ? formatPhoneNumberWithCountryCallingCode(target)
            : target,
      }),
      onConfirm: async () => {
        const [error, result] = await signInWithIdentifierAsync();

        if (error) {
          await handleError(error, preSignInErrorHandler);

          return;
        }

        if (result?.redirectTo) {
          await redirectTo(result.redirectTo);
        }
      },
      onCancel: () => {
        navigate(-1);
      },
    });
  }, [
    handleError,
    method,
    navigate,
    preSignInErrorHandler,
    redirectTo,
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
      ...preSignInErrorHandler,
      callback: errorCallback,
    }),
    [
      identifierExistErrorHandler,
      generalVerificationCodeErrorHandlers,
      preSignInErrorHandler,
      errorCallback,
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
        await redirectTo(result.redirectTo);
      }
    },
    [errorCallback, errorHandlers, handleError, redirectTo, verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useRegisterFlowCodeVerification;
