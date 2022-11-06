import { useState } from 'react';

import type { ErrorHandlers } from '@/hooks/use-api';

const useSharedErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const sharedErrorHandlers: ErrorHandlers = {
    'passcode.expired': (error) => {
      setErrorMessage(error.message);
    },
    'passcode.code_mismatch': (error) => {
      setErrorMessage(error.message);
    },
  };

  return {
    errorMessage,
    sharedErrorHandlers,
    clearErrorMessage: () => {
      setErrorMessage('');
    },
  };
};

export default useSharedErrorHandler;
