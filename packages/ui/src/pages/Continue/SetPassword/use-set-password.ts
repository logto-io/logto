import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { addProfile } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler from '@/hooks/use-error-handler';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';

const useSetPassword = () => {
  const navigate = useNavigate();
  const { show } = useConfirmModal();

  const handleError = useErrorHandler();
  const asyncAddProfile = useApi(addProfile);

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.password_exists_in_profile': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
      ...requiredProfileErrorHandler,
    }),
    [navigate, requiredProfileErrorHandler, show]
  );

  const setPassword = useCallback(
    async (password: string) => {
      const [error, result] = await asyncAddProfile({ password });

      if (error) {
        await handleError(error, errorHandlers);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncAddProfile, errorHandlers, handleError]
  );

  return {
    setPassword,
  };
};

export default useSetPassword;
