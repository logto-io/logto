import { InteractionEvent } from '@logto/schemas';
import { useCallback, useMemo } from 'react';

import { verifyStepUpVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useStepUpErrorHandler from '@/hooks/use-step-up-error-handler';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import { type VerificationCodeIdentifier } from '@/types';

import useGeneralVerificationCodeErrorHandler from '../VerificationCode/use-general-verification-code-error-handler';

/**
 * Verify a code sent to the pinned subject's primary email or phone, and complete the
 * interaction.
 *
 * The sign-in code page offers to register the identifier when it belongs to no account; here it
 * is the pinned subject's own identifier, so that branch has nothing to do. What remains is the
 * general code errors shown on the input, the step-up handlers, and the sign-in submission
 * handlers a sign-in with requested ACR still needs after this factor.
 */
const useStepUpCodeVerification = (
  identifierType: VerificationCodeIdentifier,
  verificationId: string,
  errorCallback?: () => void
) => {
  const asyncVerify = useApi(verifyStepUpVerificationCode);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const stepUpErrorHandlers = useStepUpErrorHandler();

  const { errorMessage, clearErrorMessage, generalVerificationCodeErrorHandlers } =
    useGeneralVerificationCodeErrorHandler();

  const submitInteractionErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  const errorHandlers = useMemo<ErrorHandlers>(
    () => ({
      ...generalVerificationCodeErrorHandlers,
      ...submitInteractionErrorHandler,
      ...stepUpErrorHandlers,
    }),
    [generalVerificationCodeErrorHandlers, stepUpErrorHandlers, submitInteractionErrorHandler]
  );

  const onSubmit = useCallback(
    async (code: string) => {
      const [error, result] = await asyncVerify({ type: identifierType, code, verificationId });

      if (error) {
        await handleError(error, errorHandlers);
        errorCallback?.();
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      asyncVerify,
      errorCallback,
      errorHandlers,
      handleError,
      identifierType,
      redirectTo,
      verificationId,
    ]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useStepUpCodeVerification;
