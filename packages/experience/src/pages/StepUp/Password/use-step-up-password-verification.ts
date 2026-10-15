import { InteractionEvent } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';

import { verifyStepUpPassword } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useStepUpErrorHandler from '@/hooks/use-step-up-error-handler';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';

/**
 * Verify the pinned subject's password and complete the interaction.
 *
 * The sentinel lockout errors keep their existing handling, so step-up guesses consume the same
 * budget as sign-in guesses. Beyond that, three sets of errors compose:
 *
 * - A wrong password is shown inline on the form, as it is on the sign-in password page.
 * - The step-up handlers cover a session that is gone, a subject mismatch, a route the mode
 *   forbids, and a submission that does not yet satisfy the selected class.
 * - The sign-in submission handlers cover what a sign-in with requested ACR still needs after
 *   this factor: an MFA verification, a mandatory profile, or an MFA enrollment.
 */
const useStepUpPasswordVerification = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const asyncVerifyStepUpPassword = useApi(verifyStepUpPassword);
  const stepUpErrorHandlers = useStepUpErrorHandler();
  const submitInteractionErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'session.invalid_credentials': (error) => {
        setErrorMessage(error.message);
      },
      ...submitInteractionErrorHandler,
      ...stepUpErrorHandlers,
    }),
    [stepUpErrorHandlers, submitInteractionErrorHandler]
  );

  const onSubmit = useCallback(
    async (password: string) => {
      const [error, result] = await asyncVerifyStepUpPassword(password);

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncVerifyStepUpPassword, errorHandlers, handleError, redirectTo]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useStepUpPasswordVerification;
