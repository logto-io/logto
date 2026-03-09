import { InteractionEvent } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { enableMfa } from '@/apis/experience';
import { getInteractionEventFromState } from '@/apis/utils';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';

const useEnableMfa = () => {
  const { state } = useLocation();
  const asyncEnableMfa = useApi(enableMfa);
  const redirectTo = useGlobalRedirectTo();

  const handleError = useErrorHandler();

  const interactionEvent = useMemo(
    () => getInteractionEventFromState(state) ?? InteractionEvent.SignIn,
    [state]
  );

  const submitErrorHandlers = useSubmitInteractionErrorHandler(interactionEvent, {
    replace: true,
  });

  return useCallback(async () => {
    const [error, result] = await asyncEnableMfa();
    if (error) {
      await handleError(error, submitErrorHandlers);
      return;
    }

    if (result) {
      await redirectTo(result.redirectTo);
    }
  }, [asyncEnableMfa, handleError, submitErrorHandlers, redirectTo]);
};

export default useEnableMfa;
