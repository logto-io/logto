import { useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { continueApi } from '@/apis/continue';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

const useSetPassword = () => {
  const navigate = useNavigate();
  const { show } = useConfirmModal();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler(true);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.password_exists': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
      ...requiredProfileErrorHandler,
    }),
    [navigate, requiredProfileErrorHandler, show]
  );

  const { result, run: asyncSetPassword } = useApi(continueApi, errorHandlers);

  const setPassword = useCallback(
    async (password: string) => {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      await asyncSetPassword('password', password, socialToBind);
    },
    [asyncSetPassword]
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
