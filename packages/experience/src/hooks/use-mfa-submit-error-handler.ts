import { AuthenticationContextMode, InteractionEvent } from '@logto/schemas';

import useStepUpContext from './use-step-up-context';
import useStepUpErrorHandler from './use-step-up-error-handler';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';

/** Pure step-up must not continue through sign-in enrollment or trusted-device prompts. */
const useMfaSubmitErrorHandler = () => {
  const { authenticationContext } = useStepUpContext();
  const stepUpHandlers = useStepUpErrorHandler();
  // MFA binding after registration also uses the post-identification SignIn continuation.
  const signInHandlers = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  return authenticationContext?.mode === AuthenticationContextMode.StepUp
    ? stepUpHandlers
    : signInHandlers;
};

export default useMfaSubmitErrorHandler;
