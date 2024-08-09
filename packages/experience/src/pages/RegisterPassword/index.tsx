import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import { continueRegisterWithPassword } from '@/apis/experience';
import SetPassword from '@/containers/SetPassword';
import useApi from '@/hooks/use-api';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useMfaErrorHandler from '@/hooks/use-mfa-error-handler';
import usePasswordPolicyChecker from '@/hooks/use-password-policy-checker';
import usePasswordRejectionErrorHandler from '@/hooks/use-password-rejection-handler';
import { usePasswordPolicy, useSieMethods } from '@/hooks/use-sie';

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

  const mfaErrorHandler = useMfaErrorHandler({ replace: true });
  const passwordRejectionErrorHandler = usePasswordRejectionErrorHandler({ setErrorMessage });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      // Incase previous page submitted username has been taken
      'user.username_already_in_use': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
      ...mfaErrorHandler,
      ...passwordRejectionErrorHandler,
    }),
    [mfaErrorHandler, passwordRejectionErrorHandler, show, navigate]
  );

  const onSubmitHandler = useCallback(
    async (password: string) => {
      const success = await checkPassword(password);

      if (!success) {
        return;
      }

      const [error, result] = await asyncRegisterPassword(password);

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncRegisterPassword, checkPassword, errorHandlers, handleError, redirectTo]
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
