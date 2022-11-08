import { SignInIdentifier } from '@logto/schemas';
import { useState, useMemo, useCallback, useEffect } from 'react';

import {
  signInWithUsername,
  signInWithEmailPassword,
  signInWithPhonePassword,
} from '@/apis/sign-in';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useRequiredProfileErrorHandler from './use-required-profile-error-handler';

const apiMap = {
  [SignInIdentifier.Username]: signInWithUsername,
  [SignInIdentifier.Email]: signInWithEmailPassword,
  [SignInIdentifier.Sms]: signInWithPhonePassword,
};

const usePasswordSignIn = (method: SignInIdentifier) => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.invalid_credentials': (error) => {
        setErrorMessage(error.message);
      },
      ...requiredProfileErrorHandler,
    }),
    [requiredProfileErrorHandler]
  );

  const { result, run: asyncSignIn } = useApi(apiMap[method], errorHandlers);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  const onSubmit = useCallback(
    async (identifier: string, password: string) => {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      await asyncSignIn(identifier, password, socialToBind);
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
