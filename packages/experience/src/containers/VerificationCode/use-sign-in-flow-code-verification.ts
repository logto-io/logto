import {
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { identifyWithVerificationCode, registerWithVerifiedIdentifier } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { useSieMethods } from '@/hooks/use-sie';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
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
  const navigate = useNavigateWithPreservedSearchParams();
  const redirectTo = useGlobalRedirectTo();
  const { isVerificationCodeEnabledForSignUp } = useSieMethods();
  const handleError = useErrorHandler();
  const registerWithIdentifierAsync = useApi(registerWithVerifiedIdentifier);
  const asyncSignInWithVerificationCodeIdentifier = useApi(identifyWithVerificationCode);

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();

  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });
  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register, {
    replace: true,
  });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();

  const identifierNotExistErrorHandler = useCallback(async () => {
    const { type, value } = identifier;

    // Should not redirect user to register if is sign-in only mode
    if (!isVerificationCodeEnabledForSignUp(type)) {
      void showIdentifierErrorAlert(IdentifierErrorType.IdentifierNotExist, type, value);

      return;
    }

    show({
      confirmText: 'action.continue',
      ModalContent: t('description.sign_in_id_does_not_exist', {
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
    isVerificationCodeEnabledForSignUp,
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
