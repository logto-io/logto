import { useMemo } from 'react';

import { type ContinueFlowInteractionEvent } from '@/types';

import { type ErrorHandlers } from './use-error-handler';
import useMfaErrorHandler, {
  type Options as UseMfaVerificationErrorHandlerOptions,
} from './use-mfa-error-handler';
import useRequiredProfileErrorHandler, {
  type Options as UseRequiredProfileErrorHandlerOptions,
} from './use-required-profile-error-handler';

type Options = Omit<UseRequiredProfileErrorHandlerOptions, 'interactionEvent'> &
  UseMfaVerificationErrorHandlerOptions;

/**
 * Error handlers for sign-in and registration interaction submissions.
 * Handles both profile completion and MFA verification requirements.
 *
 * Flow:
 * - Sign-in: Profile completion and MFA verification are triggered during interaction submission
 * - Register: Profile completion is triggered during user creation (identification phase)
 */
const useSubmitInteractionErrorHandler = (
  /**
   * Current interaction event 'SignIn' or 'Register'.
   * This value is passed to the profile fulfillment flow
   * when additional user profile information is required.
   */
  interactionEvent: ContinueFlowInteractionEvent,
  { replace, ...rest }: Options = {}
): ErrorHandlers => {
  const requiredProfileErrorHandler = useRequiredProfileErrorHandler({
    replace,
    interactionEvent,
    ...rest,
  });
  const mfaErrorHandler = useMfaErrorHandler({ replace });

  return useMemo(
    () => ({
      ...requiredProfileErrorHandler,
      ...mfaErrorHandler,
    }),
    [mfaErrorHandler, requiredProfileErrorHandler]
  );
};

export default useSubmitInteractionErrorHandler;
