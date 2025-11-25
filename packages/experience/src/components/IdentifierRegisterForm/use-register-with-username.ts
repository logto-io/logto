import { InteractionEvent } from '@logto/schemas';
import { useState, useCallback, useMemo, useContext } from 'react';

import CaptchaContext from '@/Providers/CaptchaContextProvider/CaptchaContext';
import { identifyAndSubmitInteraction, registerWithUsername } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { useSieMethods } from '@/hooks/use-sie';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';

const useRegisterWithUsername = () => {
  const navigate = useNavigateWithPreservedSearchParams();
  const redirectTo = useGlobalRedirectTo();
  const { executeCaptcha } = useContext(CaptchaContext);

  const [errorMessage, setErrorMessage] = useState<string>();

  const { passwordRequiredForSignUp, secondaryIdentifiers } = useSieMethods();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  const usernameErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_already_in_use': (error) => {
        setErrorMessage(error.message);
      },
    }),
    []
  );

  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register, {
    replace: true,
  });

  const handleError = useErrorHandler();
  const asyncRegister = useApi(registerWithUsername);

  const asyncSubmitInteraction = useApi(identifyAndSubmitInteraction);
  const onSubmitInteraction = useCallback(async () => {
    const [error, result] = await asyncSubmitInteraction();

    if (error) {
      await handleError(error, preRegisterErrorHandler);
      return;
    }

    if (result) {
      await redirectTo(result.redirectTo);
    }
  }, [asyncSubmitInteraction, handleError, preRegisterErrorHandler, redirectTo]);

  const onSubmit = useCallback(
    async (username: string) => {
      const captchaToken = await executeCaptcha();
      const [error] = await asyncRegister(username, captchaToken);

      if (error) {
        await handleError(error, usernameErrorHandlers);
        return;
      }

      // If password is required and no secondary identifiers are present, (current behavior without multi-sign-up identifiers support)
      // navigate to password screen directly
      if (passwordRequiredForSignUp && secondaryIdentifiers.length === 0) {
        navigate('password');
        return;
      }

      // Otherwise, identify and submit interaction let the backend decide the next step
      await onSubmitInteraction();
    },
    [
      asyncRegister,
      passwordRequiredForSignUp,
      secondaryIdentifiers.length,
      onSubmitInteraction,
      handleError,
      usernameErrorHandlers,
      navigate,
      executeCaptcha,
    ]
  );

  return { errorMessage, clearErrorMessage, onSubmit };
};

export default useRegisterWithUsername;
