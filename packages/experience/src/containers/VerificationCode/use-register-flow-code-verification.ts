import {
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { identifyWithVerificationCode, signInWithVerifiedIdentifier } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import { useSieMethods } from '@/hooks/use-sie';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';

const useRegisterFlowCodeVerification = (
  identifier: VerificationCodeIdentifier,
  verificationId: string,
  errorCallback?: () => void
) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const redirectTo = useGlobalRedirectTo();

  const { isVerificationCodeEnabledForSignIn } = useSieMethods();

  const handleError = useErrorHandler();

  const signInWithIdentifierAsync = useApi(signInWithVerifiedIdentifier);
  const verifyVerificationCode = useApi(identifyWithVerificationCode);

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();

  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register, {
    replace: true,
  });

  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();

  const identifierExistsErrorHandler = useCallback(async () => {
    const { type, value } = identifier;

    if (!isVerificationCodeEnabledForSignIn(type)) {
      void showIdentifierErrorAlert(IdentifierErrorType.IdentifierAlreadyExists, type, value);
      return;
    }

    show({
      confirmText: 'action.sign_in',
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.${type === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        value:
          type === SignInIdentifier.Phone ? formatPhoneNumberWithCountryCallingCode(value) : value,
      }),
      onConfirm: async () => {
        const [error, result] = await signInWithIdentifierAsync(verificationId);

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
    identifier,
    isVerificationCodeEnabledForSignIn,
    show,
    t,
    showIdentifierErrorAlert,
    signInWithIdentifierAsync,
    verificationId,
    handleError,
    preSignInErrorHandler,
    redirectTo,
    navigate,
  ]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.email_already_in_use': identifierExistsErrorHandler,
      'user.phone_already_in_use': identifierExistsErrorHandler,
      ...generalVerificationCodeErrorHandlers,
      ...preRegisterErrorHandler,
      callback: errorCallback,
    }),
    [
      identifierExistsErrorHandler,
      generalVerificationCodeErrorHandlers,
      preRegisterErrorHandler,
      errorCallback,
    ]
  );

  const onSubmit = useCallback(
    async (code: string) => {
      const [error, result] = await verifyVerificationCode({
        verificationId,
        identifier,
        code,
      });

      if (error) {
        await handleError(error, errorHandlers);
        errorCallback?.();

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      errorCallback,
      errorHandlers,
      handleError,
      identifier,
      redirectTo,
      verificationId,
      verifyVerificationCode,
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useRegisterFlowCodeVerification;
