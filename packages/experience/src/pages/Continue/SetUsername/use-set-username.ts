import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';

import { fulfillProfile } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import { type ContinueFlowInteractionEvent } from '@/types';

const useSetUsername = (interactionEvent: ContinueFlowInteractionEvent) => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const asyncAddProfile = useApi(fulfillProfile);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  const preSignInErrorHandler = usePreSignInErrorHandler({
    interactionEvent,
  });

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
      const [error, result] = await asyncAddProfile(
        { type: SignInIdentifier.Username, value: username },
        interactionEvent
      );

      if (error) {
        await handleError(error, errorHandlers);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncAddProfile, errorHandlers, handleError, interactionEvent, redirectTo]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useSetUsername;
