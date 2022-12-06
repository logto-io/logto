import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { registerWithEmail } from '@/apis/register';
import { verifySignInEmailPasscode } from '@/apis/sign-in';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import { UserFlow, SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useSignInWithEmailPasscodeValidation = (email: string, errorCallback?: () => void) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { errorMessage, clearErrorMessage, sharedErrorHandlers } = useSharedErrorHandler();

  const { signInMode } = useSieMethods();

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler(true);

  const { run: registerWithEmailAsync } = useApi(registerWithEmail, requiredProfileErrorHandlers);

  const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.signIn,
    SignInIdentifier.Email,
    email
  );

  const emailNotExistRegisterErrorHandler = useCallback(async () => {
    const [confirm] = await show({
      confirmText: 'action.create',
      ModalContent: t('description.sign_in_id_does_not_exists', {
        type: t(`description.email`),
        value: email,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await registerWithEmailAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [email, navigate, show, registerWithEmailAsync, t]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.email_not_exists':
        // Block user auto register if is bind social or sign-in only flow
        signInMode === SignInMode.SignIn || socialToBind
          ? identifierNotExistErrorHandler
          : emailNotExistRegisterErrorHandler,
      ...sharedErrorHandlers,
      ...requiredProfileErrorHandlers,
      callback: errorCallback,
    }),
    [
      emailNotExistRegisterErrorHandler,
      errorCallback,
      identifierNotExistErrorHandler,
      requiredProfileErrorHandlers,
      sharedErrorHandlers,
      signInMode,
      socialToBind,
    ]
  );

  const { result, run: verifyPasscode } = useApi(verifySignInEmailPasscode, errorHandlers);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  const onSubmit = useCallback(
    async (code: string) => {
      return verifyPasscode(email, code, socialToBind);
    },
    [email, socialToBind, verifyPasscode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSignInWithEmailPasscodeValidation;
