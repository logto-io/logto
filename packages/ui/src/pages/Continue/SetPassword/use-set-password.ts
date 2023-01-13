import { useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { addProfile } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';

const useSetPassword = () => {
  const navigate = useNavigate();
  const { show } = useConfirmModal();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler(true);

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

  const { result, run: asyncAddProfile } = useApi(addProfile, errorHandlers);

  const setPassword = useCallback(
    async (password: string) => {
      await asyncAddProfile({ password });
    },
    [asyncAddProfile]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [navigate, result]);

  return {
    setPassword,
  };
};

export default useSetPassword;
