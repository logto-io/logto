import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import { addProfile } from '@/apis/interaction';
import SetPasswordForm from '@/containers/SetPassword';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePasswordAction, { type SuccessHandler } from '@/hooks/use-password-action';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import { usePasswordPolicy } from '@/hooks/use-sie';

const SetPassword = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  const navigate = useNavigate();
  const { show } = usePromiseConfirmModal();
  const redirectTo = useGlobalRedirectTo();

  const preSignInErrorHandler = usePreSignInErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.password_exists_in_profile': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
      ...preSignInErrorHandler,
    }),
    [navigate, preSignInErrorHandler, show]
  );
  const successHandler: SuccessHandler<typeof addProfile> = useCallback(
    async (result) => {
      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [redirectTo]
  );

  const [action] = usePasswordAction({
    api: async (password) => addProfile({ password }),
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
      title="description.set_password"
      description={requirementsDescription && <span>{requirementsDescription}</span>}
      descriptionProps={{ min, count }}
    >
      <SetPasswordForm
        autoFocus
        errorMessage={errorMessage}
        maxLength={max}
        clearErrorMessage={clearErrorMessage}
        onSubmit={action}
      />
    </SecondaryPageLayout>
  );
};

export default SetPassword;
