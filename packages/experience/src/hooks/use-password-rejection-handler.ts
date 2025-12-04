import { type RequestErrorBody } from '@logto/schemas';
import { useCallback, useMemo } from 'react';

import usePasswordErrorMessage from '@/shared/hooks/use-password-error-message';

import type { ErrorHandlers } from './use-error-handler';

type Options = {
  setErrorMessage: (message?: string) => void;
};

const usePasswordRejectionErrorHandler = ({ setErrorMessage }: Options) => {
  const { getErrorMessageFromBody } = usePasswordErrorMessage();

  const passwordRejectionHandler = useCallback(
    (error: RequestErrorBody) => {
      setErrorMessage(getErrorMessageFromBody(error));
    },
    [getErrorMessageFromBody, setErrorMessage]
  );

  const passwordRejectionErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'password.rejected': passwordRejectionHandler,
    }),
    [passwordRejectionHandler]
  );

  return passwordRejectionErrorHandler;
};

export default usePasswordRejectionErrorHandler;
