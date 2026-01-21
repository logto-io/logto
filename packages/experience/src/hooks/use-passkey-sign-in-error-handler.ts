import { type RequestErrorBody } from '@logto/schemas';
import { useMemo } from 'react';

import { type ErrorHandlers } from './use-error-handler';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';

const usePasskeySignInErrorHandler = () => {
  const navigate = useNavigateWithPreservedSearchParams();

  return useMemo<ErrorHandlers>(
    () => ({
      'user.passkey_preferred': async (error: RequestErrorBody) => {
        navigate({ pathname: '/create-passkey' }, { replace: true });
      },
    }),
    [navigate]
  );
};

export default usePasskeySignInErrorHandler;
