import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { signInWithSms } from '@/apis/sign-in';
import useApi, { ErrorHandlers } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

const useRegisterWithSmsErrorHandler = (phone: string) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();

  const { run: signInWithSmsAsync } = useApi(signInWithSms);

  const phoneExistRegisterHandler = useCallback(async () => {
    const [confirm] = await show({
      confirmText: 'action.sign_in',
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.phone_number`),
        value: formatPhoneNumberWithCountryCallingCode(phone),
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
  }, [navigate, phone, show, signInWithSmsAsync, t]);

  const errorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.phone_exists_register': async () => {
        await phoneExistRegisterHandler();
      },
    }),
    [phoneExistRegisterHandler]
  );

  return {
    errorHandler,
  };
};

export default useRegisterWithSmsErrorHandler;
