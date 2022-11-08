import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { registerWithSms } from '@/apis/register';
import { verifySignInSmsPasscode } from '@/apis/sign-in';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { useSieMethods } from '@/hooks/use-sie';
import { UserFlow, SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useSignInWithSmsPasscodeValidation = (phone: string, errorCallback?: () => void) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { errorMessage, clearErrorMessage, sharedErrorHandlers } = useSharedErrorHandler();

  const { signInMode } = useSieMethods();

  const { run: registerWithSmsAsync } = useApi(registerWithSms);

  const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.signIn,
    SignInIdentifier.Sms,
    phone
  );

  const phoneNotExistRegisterErrorHandler = useCallback(async () => {
    const [confirm] = await show({
      confirmText: 'action.create',
      ModalContent: t('description.sign_in_id_does_not_exists', {
        type: t(`description.phone_number`),
        value: phone,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await registerWithSmsAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [phone, navigate, show, registerWithSmsAsync, t]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.phone_not_exists':
        // Block user auto register if is bind social or sign-in only flow
        signInMode === SignInMode.SignIn || socialToBind
          ? identifierNotExistErrorHandler
          : phoneNotExistRegisterErrorHandler,
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [
      phoneNotExistRegisterErrorHandler,
      errorCallback,
      identifierNotExistErrorHandler,
      sharedErrorHandlers,
      signInMode,
      socialToBind,
    ]
  );

  const { result, run: verifyPasscode } = useApi(verifySignInSmsPasscode, errorHandlers);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  const onSubmit = useCallback(
    async (code: string) => {
      return verifyPasscode(phone, code, socialToBind);
    },
    [phone, socialToBind, verifyPasscode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useSignInWithSmsPasscodeValidation;
