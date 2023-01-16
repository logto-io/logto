import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { addProfile } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-api';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';

const useSetUsername = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_already_in_use': (error) => {
        setErrorMessage(error.message);
      },
      ...requiredProfileErrorHandler,
    }),
    [requiredProfileErrorHandler]
  );

  const { result, run: asyncAddProfile } = useApi(addProfile, errorHandlers);

  const onSubmit = useCallback(
    async (username: string) => {
      await asyncAddProfile({ username });
    },
    [asyncAddProfile]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [navigate, result]);

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useSetUsername;
