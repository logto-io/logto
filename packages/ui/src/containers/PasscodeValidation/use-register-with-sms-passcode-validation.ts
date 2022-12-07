import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { verifyRegisterSmsPasscode } from '@/apis/register';
import { signInWithSms } from '@/apis/sign-in';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { useSieMethods } from '@/hooks/use-sie';
import { UserFlow } from '@/types';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useRegisterWithSmsPasscodeValidation = (phone: string, errorCallback?: () => void) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { errorMessage, clearErrorMessage, sharedErrorHandlers } = useSharedErrorHandler();
  const { signInMode } = useSieMethods();

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler(true);

  const { run: signInWithSmsAsync } = useApi(signInWithSms, requiredProfileErrorHandlers);

  const identifierExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.register,
    SignInIdentifier.Sms,
    formatPhoneNumberWithCountryCallingCode(phone)
  );

  const phoneExistSignInErrorHandler = useCallback(async () => {
    const [confirm] = await show({
      confirmText: 'action.sign_in',
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.phone_number`),
        value: phone,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await signInWithSmsAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [phone, navigate, show, signInWithSmsAsync, t]);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.phone_already_in_use':
        signInMode === SignInMode.Register
          ? identifierExistErrorHandler
          : phoneExistSignInErrorHandler,
      ...sharedErrorHandlers,
      ...requiredProfileErrorHandlers,
      callback: errorCallback,
    }),
    [
      signInMode,
      identifierExistErrorHandler,
      phoneExistSignInErrorHandler,
      sharedErrorHandlers,
      requiredProfileErrorHandlers,
      errorCallback,
    ]
  );

  const { result, run: verifyPasscode } = useApi(verifyRegisterSmsPasscode, errorHandlers);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  const onSubmit = useCallback(
    async (code: string) => {
      return verifyPasscode(phone, code);
    },
    [phone, verifyPasscode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useRegisterWithSmsPasscodeValidation;
