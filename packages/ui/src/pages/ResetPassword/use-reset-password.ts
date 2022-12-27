import { useMemo, useState, useContext, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { setUserPassword } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { PageContext } from '@/hooks/use-page-context';

const useResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setToast } = useContext(PageContext);
  const { show } = useConfirmModal();
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    setErrorMessage(undefined);
  }, []);

  const resetPasswordErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.verification_session_not_found': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-2);
      },
      'user.same_password': (error) => {
        setErrorMessage(error.message);
      },
    }),
    [navigate, setErrorMessage, show]
  );

  const { result, run: asyncResetPassword } = useApi(setUserPassword, resetPasswordErrorHandlers);

  useEffect(() => {
    if (result) {
      setToast(t('description.password_changed'));
      navigate('/sign-in', { replace: true });
    }
  }, [navigate, result, setToast, t]);

  return {
    resetPassword: asyncResetPassword,
    errorMessage,
    clearErrorMessage,
  };
};

export default useResetPassword;
