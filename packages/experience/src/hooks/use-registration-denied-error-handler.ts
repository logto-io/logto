import { type RequestErrorBody } from '@logto/schemas';
import { useCallback, useMemo } from 'react';

import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { parseGuard, registrationDeniedErrorDataGuard } from '@/types/guard';

import { usePromiseConfirmModal } from './use-confirm-modal';
import { type ErrorHandlers } from './use-error-handler';

export type Options = {
  readonly onConfirm?: () => void;
};

const getDeniedMessage = (data: unknown) => {
  const message = parseGuard(data, registrationDeniedErrorDataGuard)?.message?.trim();

  if (message) {
    return message;
  }
};

/** Shows why a pre-register action declined the registration, preferring the script's message. */
const useRegistrationDeniedErrorHandler = ({ onConfirm }: Options = {}): ErrorHandlers => {
  const navigate = useNavigateWithPreservedSearchParams();
  const { show } = usePromiseConfirmModal();

  const errorCallback = useCallback(
    async (error: RequestErrorBody) => {
      await show({
        type: 'alert',
        ModalContent: getDeniedMessage(error.data) ?? error.message,
        cancelText: 'action.got_it',
      });

      if (onConfirm) {
        onConfirm();
        return;
      }

      navigate(-1);
    },
    [navigate, onConfirm, show]
  );

  return useMemo<ErrorHandlers>(
    () => ({ 'action.registration_denied': errorCallback }),
    [errorCallback]
  );
};

export default useRegistrationDeniedErrorHandler;
