import { type RequestErrorBody } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { number, object, validate } from 'superstruct';

import { skipPasswordExpirationReminder, submitInteraction } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';

import { useConfirmModal } from './use-confirm-modal';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useToast from './use-toast';

export const passwordExpirationResetRoute = '/sign-in/password-expiration/reset';

const expirationReminderDataGuard = object({
  daysUntilExpiration: number(),
});

type Options = {
  replace?: boolean;
};

const usePasswordExpirationErrorHandler = ({ replace }: Options = {}): ErrorHandlers => {
  const navigate = useNavigateWithPreservedSearchParams();
  const redirectTo = useGlobalRedirectTo();

  const { t } = useTranslation();
  const { setToast } = useToast();
  const { show } = useConfirmModal();
  const asyncSkipReminder = useApi(skipPasswordExpirationReminder);
  const asyncSubmit = useApi(submitInteraction);
  const handleError = useErrorHandler();

  const handleExpirationReminder = useCallback(
    (error: RequestErrorBody) => {
      const [, data] = validate(error.data, expirationReminderDataGuard);

      const days = data?.daysUntilExpiration;
      const message = t('description.password_expiration_reminder_description', { days });

      show({
        ModalContent: message,
        confirmText: 'description.password_expiration_reset',
        cancelText: 'description.password_expiration_reminder_skip',
        onConfirm: () => {
          navigate({ pathname: passwordExpirationResetRoute }, { replace });
        },
        onCancel: async () => {
          const [skipError] = await asyncSkipReminder();
          if (skipError) {
            await handleError(skipError);
            return;
          }

          const [submitError, result] = await asyncSubmit();
          if (submitError) {
            await handleError(submitError);
            return;
          }

          if (result) {
            await redirectTo(result.redirectTo);
          }
        },
      });
    },
    [asyncSkipReminder, asyncSubmit, handleError, navigate, replace, show, t, redirectTo]
  );

  return useMemo<ErrorHandlers>(
    () => ({
      'password.expired': () => {
        setToast(t('description.password_expired'));
        navigate({ pathname: passwordExpirationResetRoute }, { replace });
      },
      'password.expiration_reminder': handleExpirationReminder,
    }),
    [handleExpirationReminder, navigate, replace, setToast, t]
  );
};

export default usePasswordExpirationErrorHandler;
