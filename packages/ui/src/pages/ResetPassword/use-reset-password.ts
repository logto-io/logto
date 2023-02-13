import { useMemo, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { setUserPassword } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler from '@/hooks/use-error-handler';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import { PageContext } from '@/hooks/use-page-context';

const useResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setToast } = useContext(PageContext);
  const { show } = useConfirmModal();
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleError = useErrorHandler();
  const asyncResetPassword = useApi(setUserPassword);

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

  const resetPassword = useCallback(
    async (password: string) => {
      const [error, result] = await asyncResetPassword(password);

      if (error) {
        await handleError(error, resetPasswordErrorHandlers);

        return;
      }

      if (result) {
        setToast(t('description.password_changed'));
        navigate('/sign-in', { replace: true });
      }
    },
    [asyncResetPassword, handleError, navigate, resetPasswordErrorHandlers, setToast, t]
  );

  return {
    resetPassword,
    errorMessage,
    clearErrorMessage,
  };
};

export default useResetPassword;
