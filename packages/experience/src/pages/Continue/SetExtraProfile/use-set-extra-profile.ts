import { InteractionEvent } from '@logto/schemas';
import { useCallback } from 'react';

import { fulfillProfile } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import { type ContinueFlowInteractionEvent } from '@/types';

export const useSetExtraProfile = (
  interactionEvent: ContinueFlowInteractionEvent = InteractionEvent.Register
) => {
  const asyncAddProfile = useApi(fulfillProfile);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  const submitErrorHandlers = useSubmitInteractionErrorHandler(interactionEvent);

  const onSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const [error, result] = await asyncAddProfile(
        { type: 'extraProfile', values },
        interactionEvent
      );

      if (error) {
        await handleError(error, submitErrorHandlers);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncAddProfile, submitErrorHandlers, handleError, interactionEvent, redirectTo]
  );

  return onSubmit;
};
