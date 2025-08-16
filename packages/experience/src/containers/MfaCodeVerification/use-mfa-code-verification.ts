import { InteractionEvent, type SignInIdentifier } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';

import { verifyMfaByVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';

import useGeneralVerificationCodeErrorHandler from '../VerificationCode/use-general-verification-code-error-handler';

const useMfaCodeVerification = (
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone,
  verificationId: string,
  errorCallback?: () => void
) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const asyncVerify = useApi(verifyMfaByVerificationCode);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  const { generalVerificationCodeErrorHandlers, errorMessage: generalErrorMessage } =
    useGeneralVerificationCodeErrorHandler();

  // In sign-in event, submitting interaction shares same error handling
  const submitInteractionErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      ...generalVerificationCodeErrorHandlers,
      ...submitInteractionErrorHandler,
    }),
    [generalVerificationCodeErrorHandlers, submitInteractionErrorHandler]
  );

  const onSubmit = useCallback(
    async (code: string) => {
      const [error, result] = await asyncVerify(verificationId, code, identifierType);

      if (error) {
        await handleError(error, errorHandlers);
        setErrorMessage(generalErrorMessage);
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
      generalErrorMessage,
      handleError,
      identifierType,
      redirectTo,
      verificationId,
    ]
  );

  return {
    errorMessage: errorMessage ?? generalErrorMessage,
    onSubmit,
  };
};

export default useMfaCodeVerification;
