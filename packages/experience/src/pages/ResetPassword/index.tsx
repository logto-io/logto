import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { resetPassword } from '@/apis/experience';
import SetPassword from '@/containers/SetPassword';
import useApi from '@/hooks/use-api';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import usePasswordPolicyChecker from '@/hooks/use-password-policy-checker';
import usePasswordRejectionErrorHandler from '@/hooks/use-password-rejection-handler';
import { usePasswordPolicy } from '@/hooks/use-sie';
import useToast from '@/hooks/use-toast';

const ResetPassword = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);
  const { t } = useTranslation();
  const { setToast } = useToast();
  const navigate = useNavigate();
  const { show } = usePromiseConfirmModal();
  const { setForgotPasswordIdentifierInputValue } = useContext(UserInteractionContext);

  const checkPassword = usePasswordPolicyChecker({ setErrorMessage });
  const asyncResetPassword = useApi(resetPassword);
  const handleError = useErrorHandler();

  const passwordRejectionErrorHandler = usePasswordRejectionErrorHandler({ setErrorMessage });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.verification_session_not_found': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-2);
      },
      'user.same_password': (error) => {
        setErrorMessage(error.message);
      },
      ...passwordRejectionErrorHandler,
    }),
    [navigate, passwordRejectionErrorHandler, show]
  );

  const onSubmitHandler = useCallback(
    async (password: string) => {
      const success = await checkPassword(password);

      if (!success) {
        return;
      }

      const [error] = await asyncResetPassword(password);

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      // Clear the forgot password identifier input value
      setForgotPasswordIdentifierInputValue(undefined);
      setToast(t('description.password_changed'));
      navigate('/sign-in', { replace: true });
    },
    [
      asyncResetPassword,
      checkPassword,
      errorHandlers,
      handleError,
      navigate,
      setForgotPasswordIdentifierInputValue,
      setToast,
      t,
    ]
  );

  const {
    policy: {
      length: { min, max },
      characterTypes: { min: count },
    },
    requirementsDescription,
  } = usePasswordPolicy();

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

export default ResetPassword;
