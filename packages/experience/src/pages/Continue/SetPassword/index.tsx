import { useCallback, useMemo, useState } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import { fulfillProfile } from '@/apis/experience';
import SetPasswordForm from '@/containers/SetPassword';
import useApi from '@/hooks/use-api';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import usePasswordPolicyChecker from '@/hooks/use-password-policy-checker';
import usePasswordRejectionErrorHandler from '@/hooks/use-password-rejection-handler';
import { usePasswordPolicy } from '@/hooks/use-sie';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import { type ContinueFlowInteractionEvent } from '@/types';

type Props = {
  readonly interactionEvent: ContinueFlowInteractionEvent;
};

const SetPassword = ({ interactionEvent }: Props) => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  const navigate = useNavigateWithPreservedSearchParams();
  const { show } = usePromiseConfirmModal();
  const redirectTo = useGlobalRedirectTo();

  const checkPassword = usePasswordPolicyChecker({ setErrorMessage });
  const addPassword = useApi(fulfillProfile);
  const handleError = useErrorHandler();

  const passwordRejectionErrorHandler = usePasswordRejectionErrorHandler({ setErrorMessage });
  const submitInteractionErrorHandler = useSubmitInteractionErrorHandler(interactionEvent, {
    replace: true,
  });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.password_exists_in_profile': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-1);
      },
      ...submitInteractionErrorHandler,
      ...passwordRejectionErrorHandler,
    }),
    [navigate, passwordRejectionErrorHandler, submitInteractionErrorHandler, show]
  );

  const onSubmitHandler = useCallback(
    async (password: string) => {
      const success = await checkPassword(password);

      if (!success) {
        return;
      }

      const [error, result] = await addPassword(
        { type: 'password', value: password },
        interactionEvent
      );

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [addPassword, checkPassword, errorHandlers, interactionEvent, handleError, redirectTo]
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
      title="description.set_password"
      description={requirementsDescription && <span>{requirementsDescription}</span>}
      descriptionProps={{ min, count }}
    >
      <SetPasswordForm
        autoFocus
        errorMessage={errorMessage}
        maxLength={max}
        clearErrorMessage={clearErrorMessage}
        onSubmit={onSubmitHandler}
      />
    </SecondaryPageLayout>
  );
};

export default SetPassword;
