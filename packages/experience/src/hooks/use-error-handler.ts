import type { LogtoErrorCode } from '@logto/phrases';
import { experience, type RequestErrorBody } from '@logto/schemas';
import { HTTPError, TimeoutError } from 'ky';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';
import useToast from './use-toast';

export type ErrorHandlers = {
  [key in LogtoErrorCode]?: (error: RequestErrorBody) => void | Promise<void>;
} & {
  // Overwrite default global error handle logic
  global?: (error: RequestErrorBody) => void | Promise<void>;
};

/**
 * Built-in handlers for terminal error codes that should land on a dedicated page
 * instead of a transient toast. Specific per-call handlers still take precedence;
 * these only run when the caller did not handle the code and before falling back
 * to `global` / toast.
 */
const getTerminalErrorPath = (code: LogtoErrorCode): string | undefined => {
  if (code === 'user.suspended') {
    return `/${experience.routes.accountSuspended}`;
  }

  return undefined;
};

const useErrorHandler = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  const navigate = useNavigateWithPreservedSearchParams();

  const handleError = useCallback(
    async (error: unknown, errorHandlers?: ErrorHandlers) => {
      if (error instanceof HTTPError) {
        try {
          const logtoError = await error.response.json<RequestErrorBody>();

          const { code, message } = logtoError;
          const terminalPath = getTerminalErrorPath(code);

          const handler =
            errorHandlers?.[code] ??
            (terminalPath
              ? () => {
                  navigate(terminalPath, { replace: true });
                }
              : errorHandlers?.global);

          if (handler) {
            await handler(logtoError);
          } else {
            setToast(message);
          }

          return;
        } catch (error) {
          setToast(t('error.unknown'));
          console.error(error);

          return;
        }
      }

      if (error instanceof TimeoutError) {
        setToast(t('error.timeout'));

        return;
      }

      setToast(t('error.unknown'));
      console.error(error);
    },
    [navigate, setToast, t]
  );

  return handleError;
};

export default useErrorHandler;
