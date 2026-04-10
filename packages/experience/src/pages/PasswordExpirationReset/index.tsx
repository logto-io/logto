import { useCallback, useMemo, useState } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import { resetExpiredPassword } from '@/apis/experience';
import SetPassword from '@/containers/SetPassword/SetPassword';
import useApi from '@/hooks/use-api';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePasswordPolicyChecker from '@/hooks/use-password-policy-checker';
import usePasswordRejectionErrorHandler from '@/hooks/use-password-rejection-handler';
import { usePasswordPolicy } from '@/hooks/use-sie';

const PasswordExpirationReset = () => {
  const redirectTo = useGlobalRedirectTo();

  const [errorMessage, setErrorMessage] = useState<string>();
  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  const checkPassword = usePasswordPolicyChecker({ setErrorMessage });
  const asyncResetExpiredPassword = useApi(resetExpiredPassword);
  const handleError = useErrorHandler();
  const passwordRejectionErrorHandler = usePasswordRejectionErrorHandler({ setErrorMessage });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.same_password': (error) => {
        setErrorMessage(error.message);
      },
      ...passwordRejectionErrorHandler,
    }),
    [passwordRejectionErrorHandler]
  );

  const onSubmitHandler = useCallback(
    async (password: string) => {
      const success = await checkPassword(password);

      if (!success) {
        return;
      }

      const [error, result] = await asyncResetExpiredPassword(password);

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncResetExpiredPassword, checkPassword, errorHandlers, handleError, redirectTo]
  );

  const {
    policy: {
      length: { min },
      characterTypes: { min: count },
    },
    requirementsDescription,
  } = usePasswordPolicy();

  return (
    <SecondaryPageLayout
      title="description.password_expiration_reset"
      description={requirementsDescription && <span>{requirementsDescription}</span>}
      descriptionProps={{ min, count }}
    >
      <SetPassword
        autoFocus
        errorMessage={errorMessage}
        clearErrorMessage={clearErrorMessage}
        onSubmit={onSubmitHandler}
      />
    </SecondaryPageLayout>
  );
};

export default PasswordExpirationReset;
