import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  registerWithVerifiedIdentifier,
  signInWithVerificationCodeIdentifier,
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

const useSignInFlowCodeVerification = (
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
  const registerWithIdentifierAsync = useApi(registerWithVerifiedIdentifier);
  const asyncSignInWithVerificationCodeIdentifier = useApi(signInWithVerificationCodeIdentifier);

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();

  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();

  const identifierNotExistErrorHandler = useCallback(async () => {
    // Should not redirect user to register if is sign-in only mode or bind social flow
    if (signInMode === SignInMode.SignIn) {
      void showIdentifierErrorAlert(IdentifierErrorType.IdentifierNotExist, method, target);

      return;
    }

    show({
      confirmText: 'action.create',
      ModalContent: t('description.sign_in_id_does_not_exist', {
        type: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        value:
          method === SignInIdentifier.Phone
            ? formatPhoneNumberWithCountryCallingCode(target)
            : target,
      }),
      onConfirm: async () => {
        const [error, result] = await registerWithIdentifierAsync(
          method === SignInIdentifier.Email ? { email: target } : { phone: target }
        );

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
    signInMode,
    show,
    t,
    method,
    target,
    registerWithIdentifierAsync,
    showIdentifierErrorAlert,
    navigate,
    handleError,
    preSignInErrorHandler,
    redirectTo,
  ]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.user_not_exist': identifierNotExistErrorHandler,
      ...generalVerificationCodeErrorHandlers,
      ...preSignInErrorHandler,
      callback: errorCallback,
    }),
    [
      errorCallback,
      identifierNotExistErrorHandler,
      preSignInErrorHandler,
      generalVerificationCodeErrorHandlers,
    ]
  );

  const onSubmit = useCallback(
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      const [error, result] = await asyncSignInWithVerificationCodeIdentifier(payload);

      if (error) {
        await handleError(error, errorHandlers);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncSignInWithVerificationCodeIdentifier, errorHandlers, handleError, redirectTo]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSignInFlowCodeVerification;
