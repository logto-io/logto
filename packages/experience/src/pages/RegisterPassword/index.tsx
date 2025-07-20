import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import { continueRegisterWithPassword } from '@/apis/experience';
import SetPassword from '@/containers/SetPassword';
import useApi from '@/hooks/use-api';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePasswordInterceptor from '@/hooks/use-password-interceptor';
import usePasswordPolicyChecker from '@/hooks/use-password-policy-checker';
import usePasswordRejectionErrorHandler from '@/hooks/use-password-rejection-handler';
import { usePasswordPolicy, useSieMethods } from '@/hooks/use-sie';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';

import ErrorPage from '../ErrorPage';

const RegisterPassword = () => {
  const { signUpMethods } = useSieMethods();

  const navigate = useNavigate();
  const redirectTo = useGlobalRedirectTo();
  const { show } = usePromiseConfirmModal();
  const [errorMessage, setErrorMessage] = useState<string>();
  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  const checkPassword = usePasswordPolicyChecker({ setErrorMessage });
  const asyncRegisterPassword = useApi(continueRegisterWithPassword);
  const handleError = useErrorHandler();
  const { processPassword, handleSecretManagement } = usePasswordInterceptor();

  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register, {
    replace: true,
  });
  const passwordRejectionErrorHandler = usePasswordRejectionErrorHandler({ setErrorMessage });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      // Incase previous page submitted username has been taken
      'user.username_already_in_use': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
      ...preRegisterErrorHandler,
      ...passwordRejectionErrorHandler,
    }),
    [preRegisterErrorHandler, passwordRejectionErrorHandler, show, navigate]
  );

  const onSubmitHandler = useCallback(
    async (password: string) => {
      const success = await checkPassword(password);

      if (!success) {
        return;
      }

      // Check if we need to handle zero-knowledge encryption
      const publicKey = new URLSearchParams(window.location.search).get('public_key');

      if (publicKey) {
        // Process password to get server password for zero-knowledge flow
        const serverPassword = await processPassword(password);
        // Use the enhanced registration flow with secret management
        const [error, result] = await asyncRegisterPassword(
          serverPassword,
          async (encryptedSecret) => {
            // For registration, we use a dummy verification ID as it's not needed
            await handleSecretManagement('registration', encryptedSecret);
          }
        );

        if (error) {
          await handleError(error, errorHandlers);
          return;
        }

        if (result?.redirectTo) {
          await redirectTo(result.redirectTo);
        }
      } else {
        // Use the standard flow without password processing
        const [error, result] = await asyncRegisterPassword(password);

        if (error) {
          await handleError(error, errorHandlers);
          return;
        }

        if (result?.redirectTo) {
          await redirectTo(result.redirectTo);
        }
      }
    },
    [
      asyncRegisterPassword,
      checkPassword,
      errorHandlers,
      handleError,
      redirectTo,
      processPassword,
      handleSecretManagement,
    ]
  );

  const {
    policy: {
      length: { min, max },
      characterTypes: { min: count },
    },
    requirementsDescription,
  } = usePasswordPolicy();

  if (!signUpMethods.includes(SignInIdentifier.Username)) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageLayout
      title="description.new_password"
      description={requirementsDescription && <span>{requirementsDescription}</span>}
      descriptionProps={{ min, count }}
    >
      <SetPassword
        autoFocus
        errorMessage={errorMessage}
        maxLength={max}
        clearErrorMessage={clearErrorMessage}
        onSubmit={onSubmitHandler}
      />
    </SecondaryPageLayout>
  );
};

export default RegisterPassword;
