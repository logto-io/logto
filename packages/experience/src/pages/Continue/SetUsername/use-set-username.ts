import { useState, useCallback, useMemo } from 'react';

import { addProfile } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';

const useSetUsername = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const asyncAddProfile = useApi(addProfile);
  const handleError = useErrorHandler();

  const preSignInErrorHandler = usePreSignInErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_already_in_use': (error) => {
        setErrorMessage(error.message);
      },
      ...preSignInErrorHandler,
    }),
    [preSignInErrorHandler]
  );

  const onSubmit = useCallback(
    async (username: string) => {
      const [error, result] = await asyncAddProfile({ username });

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

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useSetUsername;
