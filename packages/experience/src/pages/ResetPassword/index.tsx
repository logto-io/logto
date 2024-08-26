import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { setUserPassword } from '@/apis/interaction';
import SetPassword from '@/containers/SetPassword';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import { type ErrorHandlers } from '@/hooks/use-error-handler';
import usePasswordAction, { type SuccessHandler } from '@/hooks/use-password-action';
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
  const {
    identifierInputValue,
    setIdentifierInputValue,
    forgotPasswordIdentifierInputValue,
    setForgotPasswordIdentifierInputValue,
  } = useContext(UserInteractionContext);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.verification_session_not_found': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-2);
      },
      'user.same_password': (error) => {
        setErrorMessage(error.message);
      },
    }),
    [navigate, setErrorMessage, show]
  );
  const successHandler: SuccessHandler<typeof setUserPassword> = useCallback(
    (result) => {
      if (result) {
        /**
         * Improve user experience by caching the identifier input value for sign-in page
         * when the user is first redirected to the reset password page.
         * This allows user to continue the sign flow without having to re-enter the identifier.
         */
        if (!identifierInputValue) {
          setIdentifierInputValue(forgotPasswordIdentifierInputValue);
        }

        // Clear the forgot password identifier input value after the password is set
        setForgotPasswordIdentifierInputValue(undefined);

        setToast(t('description.password_changed'));
        navigate('/sign-in', { replace: true });
      }
    },
    [
      forgotPasswordIdentifierInputValue,
      identifierInputValue,
      navigate,
      setForgotPasswordIdentifierInputValue,
      setIdentifierInputValue,
      setToast,
      t,
    ]
  );

  const [action] = usePasswordAction({
    api: setUserPassword,
    setErrorMessage,
    errorHandlers,
    successHandler,
  });

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
        onSubmit={action}
      />
    </SecondaryPageLayout>
  );
};

export default ResetPassword;
