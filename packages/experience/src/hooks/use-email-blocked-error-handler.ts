import { type RequestErrorBody } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePromiseConfirmModal } from './use-confirm-modal';
import { type ErrorHandlers } from './use-error-handler';

const useEmailBlockedErrorHandler = (): ErrorHandlers => {
  const navigate = useNavigate();
  const { show } = usePromiseConfirmModal();

  const errorCallback = useCallback(
    async (error: RequestErrorBody) => {
      await show({
        type: 'alert',
        ModalContent: error.message,
        cancelText: 'action.got_it',
      });
      navigate(-1);
    },
    [navigate, show]
  );

  return useMemo<ErrorHandlers>(
    () => ({
      'session.email_blocklist.email_not_allowed': errorCallback,
      'session.email_blocklist.email_subaddressing_not_allowed': errorCallback,
    }),
    [errorCallback]
  );
};

export default useEmailBlockedErrorHandler;
