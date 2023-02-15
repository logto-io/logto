import type { LogtoErrorCode } from '@logto/phrases';
import type { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { PageContext } from '@/hooks/use-page-context';

export type ErrorHandlers = {
  [key in LogtoErrorCode]?: (error: RequestErrorBody) => void | Promise<void>;
} & {
  // Overwrite default global error handle logic
  global?: (error: RequestErrorBody) => void | Promise<void>;
};

const useErrorHandler = () => {
  const { t } = useTranslation();
  const { setToast } = useContext(PageContext);

  const handleError = useCallback(
    async (error: unknown, errorHandlers?: ErrorHandlers) => {
      if (error instanceof HTTPError) {
        try {
          const logtoError = await error.response.json<RequestErrorBody>();

          const { code, message } = logtoError;
          const handler = errorHandlers?.[code] ?? errorHandlers?.global;

          if (handler) {
            await handler(logtoError);
          } else {
            setToast(message);
          }

          return;
        } catch {
          setToast(t('error.unknown'));
          console.error(error);

          return;
        }
      }

      setToast(t('error.unknown'));
      console.error(error);
    },
    [setToast, t]
  );

  return handleError;
};

export default useErrorHandler;
