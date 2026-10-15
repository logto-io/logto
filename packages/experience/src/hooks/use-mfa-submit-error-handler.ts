import { InteractionEvent } from '@logto/schemas';

import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';

/** Pure step-up must not continue through sign-in enrollment or trusted-device prompts. */
const useMfaSubmitErrorHandler = () => {
  // MFA binding after registration also uses the post-identification SignIn continuation.
  return useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });
};

export default useMfaSubmitErrorHandler;
