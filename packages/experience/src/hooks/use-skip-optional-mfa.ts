import { InteractionEvent } from '@logto/schemas';
import { useCallback } from 'react';

import { skipMfaSuggestion } from '@/apis/experience';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';

/**
 * Skip handler for optional "add another MFA" suggestion during registration.
 * Only stores skip in current interaction; does not persist to user account.
 */
const useSkipOptionalMfa = () => {
  const asyncSkip = useApi(skipMfaSuggestion);
  const redirectTo = useGlobalRedirectTo();

  const handleError = useErrorHandler();
  /**
   * Reuse pre-sign-in error handler for post-skip submission flow.
   */
  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  return useCallback(async () => {
    const [error, result] = await asyncSkip();
    if (error) {
      await handleError(error, preSignInErrorHandler);
      return;
    }

    if (result) {
      await redirectTo(result.redirectTo);
    }
  }, [asyncSkip, handleError, preSignInErrorHandler, redirectTo]);
};

export default useSkipOptionalMfa;
