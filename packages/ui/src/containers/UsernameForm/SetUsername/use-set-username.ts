import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { continueWithUsername } from '@/apis/continue';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-api';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

const useSetUsername = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_exists_register': (error) => {
        setErrorMessage(error.message);
      },
      ...requiredProfileErrorHandler,
    }),
    [requiredProfileErrorHandler]
  );

  const { result, run: setUsername } = useApi(continueWithUsername, errorHandlers);

  const onSubmit = useCallback(
    async (username: string) => {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      await setUsername(username, socialToBind);
    },
    [setUsername]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [navigate, result]);

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useSetUsername;
