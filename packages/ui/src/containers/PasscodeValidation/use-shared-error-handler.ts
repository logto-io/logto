import { useState, useMemo } from 'react';

import type { ErrorHandlers } from '@/hooks/use-api';

const useSharedErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  // Have to wrap up in a useMemo hook otherwise the handler updates on every cycle
  const sharedErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'passcode.expired': (error) => {
        setErrorMessage(error.message);
      },
      'passcode.code_mismatch': (error) => {
        setErrorMessage(error.message);
      },
    }),
    []
  );

  return {
    errorMessage,
    sharedErrorHandlers,
    clearErrorMessage: () => {
      setErrorMessage('');
    },
  };
};

export default useSharedErrorHandler;
