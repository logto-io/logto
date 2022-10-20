import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ErrorHandlers } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

const useForgotPasswordWithSmsErrorHandler = (phone: string) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();

  const phoneNotExistForgotPasswordHandler = useCallback(async () => {
    await show({
      type: 'alert',
      ModalContent: t('description.forgot_password_id_does_not_exits', {
        type: t(`description.phone_number`),
        value: formatPhoneNumberWithCountryCallingCode(phone),
      }),
      cancelText: 'action.got_it',
    });
    navigate(-1);
  }, [navigate, show, t, phone]);

  const errorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.phone_not_exists': phoneNotExistForgotPasswordHandler,
    }),
    [phoneNotExistForgotPasswordHandler]
  );

  return {
    errorHandler,
  };
};

export default useForgotPasswordWithSmsErrorHandler;
