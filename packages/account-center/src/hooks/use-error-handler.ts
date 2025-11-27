import type { RequestErrorBody } from '@logto/schemas';
import { HTTPError, TimeoutError } from 'ky';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { sessionExpiredRoute } from '@ac/constants/routes';

export type ErrorHandlers = {
  [key in RequestErrorBody['code']]?: (error: RequestErrorBody) => void | Promise<void>;
} & {
  // Overwrite default global error handle logic
  global?: (error: RequestErrorBody) => void | Promise<void>;
};

const useErrorHandler = () => {
  const { t } = useTranslation();
  const { setToast } = useContext(PageContext);
  const navigate = useNavigate();

  const handleError = useCallback(
    async (error: unknown, errorHandlers?: ErrorHandlers) => {
      if (error instanceof HTTPError) {
        if (error.response.status === 401) {
          void navigate(sessionExpiredRoute, { replace: true });
          return;
        }

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
