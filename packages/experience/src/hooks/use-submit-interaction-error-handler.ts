import { cond } from '@silverhand/essentials';
import { useMemo } from 'react';

import { stepUpRoutes } from '@/constants/step-up';
import { type ContinueFlowInteractionEvent } from '@/types';

import useEmailBlockedErrorHandler from './use-email-blocked-error-handler';
import { type ErrorHandlers } from './use-error-handler';
import useMfaErrorHandler, {
  type Options as UseMfaVerificationErrorHandlerOptions,
} from './use-mfa-error-handler';
import useMissingPasskeyErrorHandler from './use-missing-passkey-error-handler';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';
import useRequiredProfileErrorHandler, {
  type Options as UseRequiredProfileErrorHandlerOptions,
} from './use-required-profile-error-handler';
import useTrustedDeviceOptInErrorHandler from './use-trusted-device-opt-in-error-handler';

type Options = Omit<UseRequiredProfileErrorHandlerOptions, 'interactionEvent'> &
  UseMfaVerificationErrorHandlerOptions & {
    readonly onEmailBlocked?: () => void;
  };

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
  { replace, onEmailBlocked, ...rest }: Options = {}
): ErrorHandlers => {
  const navigate = useNavigateWithPreservedSearchParams();
  const requiredProfileErrorHandler = useRequiredProfileErrorHandler({
    replace,
    interactionEvent,
    ...rest,
  });
  const mfaErrorHandler = useMfaErrorHandler({ replace });
  const emailBlockedErrorHandler = useEmailBlockedErrorHandler({ onConfirm: onEmailBlocked });
  const passkeySignInErrorHandler = useMissingPasskeyErrorHandler(interactionEvent);
  const trustedDeviceOptInErrorHandler = useTrustedDeviceOptInErrorHandler(interactionEvent);

  return useMemo(
    () => ({
      ...emailBlockedErrorHandler,
      ...requiredProfileErrorHandler,
      ...mfaErrorHandler,
      ...cond(passkeySignInErrorHandler),
      ...trustedDeviceOptInErrorHandler,
      /**
       * A sign-in with requested ACR needs a first factor the user can verify. The error is only a
       * navigation signal: the step-up landing reads `availableMethods` and the masked identifiers
       * from `GET /experience/interaction` and forwards to the pinned-user first-factor page, so
       * the continuation is refresh-safe and carries nothing in `location.state`.
       */
      'session.step_up.require_verification': () => {
        navigate(stepUpRoutes.landing, { replace: true });
      },
    }),
    [
      emailBlockedErrorHandler,
      mfaErrorHandler,
      navigate,
      passkeySignInErrorHandler,
      requiredProfileErrorHandler,
      trustedDeviceOptInErrorHandler,
    ]
  );
};

export default useSubmitInteractionErrorHandler;
