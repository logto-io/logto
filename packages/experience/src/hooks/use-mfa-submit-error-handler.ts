import { InteractionEvent } from '@logto/schemas';

import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';

const useMfaSubmitErrorHandler = () => {
  // MFA binding after registration also uses the post-identification SignIn continuation.
  return useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });
};

export default useMfaSubmitErrorHandler;
