import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  signInWithVerificationCodeIdentifier,
  registerWithVerifiedIdentifier,
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

const useSignInFlowCodeVerification = (
  method: VerificationCodeIdentifier,
  target: string,
  errorCallback?: () => void
) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { signInMode } = useSieMethods();

  const handleError = useErrorHandler();
  const registerWithIdentifierAsync = useApi(registerWithVerifiedIdentifier);
  const asyncSignInWithVerificationCodeIdentifier = useApi(signInWithVerificationCodeIdentifier);

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler({
    replace: true,
  });
  const showIdentifierErrorAlert = useIdentifierErrorAlert();

  const identifierNotExistErrorHandler = useCallback(async () => {
    // Should not redirect user to register if is sign-in only mode or bind social flow
    if (signInMode === SignInMode.SignIn) {
      void showIdentifierErrorAlert(IdentifierErrorType.IdentifierNotExist, method, target);

      return;
    }

    const [confirm] = await show({
      confirmText: 'action.create',
      ModalContent: t('description.sign_in_id_does_not_exist', {
        ype: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
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

    const [error, result] = await registerWithIdentifierAsync(
      method === SignInIdentifier.Email ? { email: target } : { phone: target }
    );

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
    registerWithIdentifierAsync,
    requiredProfileErrorHandlers,
    show,
    showIdentifierErrorAlert,
    signInMode,
    t,
    target,
  ]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.user_not_exist': identifierNotExistErrorHandler,
      ...generalVerificationCodeErrorHandlers,
      ...requiredProfileErrorHandlers,
      callback: errorCallback,
    }),
    [
      errorCallback,
      identifierNotExistErrorHandler,
      requiredProfileErrorHandlers,
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
        window.location.replace(result.redirectTo);
      }
    },
    [asyncSignInWithVerificationCodeIdentifier, errorHandlers, handleError]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSignInFlowCodeVerification;
