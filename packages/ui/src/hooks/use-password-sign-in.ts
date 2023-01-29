import { useState, useMemo, useCallback, useEffect } from 'react';

import type { PasswordSignInPayload } from '@/apis/interaction';
import { signInWithPasswordIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { UserFlow } from '@/types';

import useRequiredProfileErrorHandler from './use-required-profile-error-handler';

const usePasswordSignIn = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler({ flow: UserFlow.signIn });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.invalid_credentials': (error) => {
        setErrorMessage(error.message);
      },
      ...requiredProfileErrorHandler,
    }),
    [requiredProfileErrorHandler]
  );

  const { result, run: asyncSignIn } = useApi(signInWithPasswordIdentifier, errorHandlers);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  const onSubmit = useCallback(
    async (payload: PasswordSignInPayload) => {
      await asyncSignIn(payload);
    },
    [asyncSignIn]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default usePasswordSignIn;
