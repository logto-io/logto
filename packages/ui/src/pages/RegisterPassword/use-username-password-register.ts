import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { setUserPassword } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler from '@/hooks/use-error-handler';
import type { ErrorHandlers } from '@/hooks/use-error-handler';

const useUsernamePasswordRegister = () => {
  const navigate = useNavigate();
  const { show } = useConfirmModal();

  const handleError = useErrorHandler();
  const asyncSetPassword = useApi(setUserPassword);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      // Incase previous page submitted username has been taken
      'user.username_already_in_use': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
    }),
    [navigate, show]
  );

  return useCallback(
    async (password: string) => {
      const [error, result] = await asyncSetPassword(password);

      if (error) {
        await handleError(error, errorHandlers);
      }

      if (result && 'redirectTo' in result) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncSetPassword, errorHandlers, handleError]
  );
};

export default useUsernamePasswordRegister;
