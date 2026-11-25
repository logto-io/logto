import { InteractionEvent } from '@logto/schemas';
import { useCallback } from 'react';

import { skipMfa } from '@/apis/experience';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';

const useSkipMfa = () => {
  const asyncSkipMfa = useApi(skipMfa);
  const redirectTo = useGlobalRedirectTo();

  const handleError = useErrorHandler();
  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  return useCallback(async () => {
    const [error, result] = await asyncSkipMfa();
    if (error) {
      await handleError(error, preSignInErrorHandler);
      return;
    }

    if (result) {
      await redirectTo(result.redirectTo);
    }
  }, [asyncSkipMfa, handleError, preSignInErrorHandler, redirectTo]);
};

export default useSkipMfa;
