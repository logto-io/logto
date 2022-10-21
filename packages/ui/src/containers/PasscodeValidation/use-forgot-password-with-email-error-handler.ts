import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ErrorHandlers } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';

const useForgotPasswordWithEmailErrorHandler = (email: string) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();

  const emailNotExistForgotPasswordHandler = useCallback(async () => {
    await show({
      type: 'alert',
      ModalContent: t('description.forgot_password_id_does_not_exits', {
        type: t(`description.email`),
        value: email,
      }),
      cancelText: 'action.got_it',
    });
    navigate(-1);
  }, [navigate, show, t, email]);

  const errorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.email_not_exists': emailNotExistForgotPasswordHandler,
    }),
    [emailNotExistForgotPasswordHandler]
  );

  return {
    errorHandler,
  };
};

export default useForgotPasswordWithEmailErrorHandler;
