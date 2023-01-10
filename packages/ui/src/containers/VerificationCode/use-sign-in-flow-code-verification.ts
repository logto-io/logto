import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
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
import type { VerificationCodeIdentifier } from '@/types';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

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

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();

  const { signInMode } = useSieMethods();

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler(true);

  const { run: registerWithIdentifierAsync } = useApi(
    registerWithVerifiedIdentifier,
    requiredProfileErrorHandlers
  );

  const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

  const showIdentifierErrorAlert = useIdentifierErrorAlert();

  const identifierNotExistErrorHandler = useCallback(async () => {
    // Should not redirect user to register if is sign-in only mode or bind social flow
    if (signInMode === SignInMode.SignIn || socialToBind) {
      void showIdentifierErrorAlert(IdentifierErrorType.IdentifierNotExist, method, target);

      return;
    }

    const [confirm] = await show({
      confirmText: 'action.create',
      ModalContent: t('description.sign_in_id_does_not_exist', {
        ype: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        value: target,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await registerWithIdentifierAsync(
      method === SignInIdentifier.Email ? { email: target } : { phone: target }
    );

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [
    method,
    navigate,
    registerWithIdentifierAsync,
    show,
    showIdentifierErrorAlert,
    signInMode,
    socialToBind,
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
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      return asyncSignInWithVerificationCodeIdentifier(payload, socialToBind);
    },
    [asyncSignInWithVerificationCodeIdentifier, socialToBind]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSignInFlowCodeVerification;
