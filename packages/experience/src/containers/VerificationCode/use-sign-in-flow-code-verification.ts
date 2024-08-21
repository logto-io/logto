import {
  InteractionEvent,
  SignInIdentifier,
  SignInMode,
  type VerificationCodeIdentifier,
} from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { identifyWithVerificationCode, registerWithVerifiedIdentifier } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';

const useSignInFlowCodeVerification = (
  identifier: VerificationCodeIdentifier,
  verificationId: string,
  errorCallback?: () => void
) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const redirectTo = useGlobalRedirectTo();
  const { signInMode, signUpMethods } = useSieMethods();
  const handleError = useErrorHandler();
  const registerWithIdentifierAsync = useApi(registerWithVerifiedIdentifier);
  const asyncSignInWithVerificationCodeIdentifier = useApi(identifyWithVerificationCode);

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();

  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

  const preRegisterErrorHandler = usePreSignInErrorHandler({
    interactionEvent: InteractionEvent.Register,
  });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();

  const identifierNotExistErrorHandler = useCallback(async () => {
    const { type, value } = identifier;

    // Should not redirect user to register if is sign-in only mode or bind social flow
    if (signInMode === SignInMode.SignIn || !signUpMethods.includes(type)) {
      void showIdentifierErrorAlert(IdentifierErrorType.IdentifierNotExist, type, value);

      return;
    }

    show({
      confirmText: 'action.create',
      ModalContent: t('description.sign_in_id_does_not_exist', {
        type: t(`description.${type === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        value:
          type === SignInIdentifier.Phone ? formatPhoneNumberWithCountryCallingCode(value) : value,
      }),
      onConfirm: async () => {
        const [error, result] = await registerWithIdentifierAsync(verificationId);

        if (error) {
          await handleError(error, preRegisterErrorHandler);

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
    identifier,
    signInMode,
    signUpMethods,
    show,
    t,
    showIdentifierErrorAlert,
    registerWithIdentifierAsync,
    verificationId,
    handleError,
    preRegisterErrorHandler,
    redirectTo,
    navigate,
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
    async (code: string) => {
      const [error, result] = await asyncSignInWithVerificationCodeIdentifier({
        verificationId,
        identifier,
        code,
      });

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      asyncSignInWithVerificationCodeIdentifier,
      errorHandlers,
      handleError,
      identifier,
      redirectTo,
      verificationId,
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSignInFlowCodeVerification;
