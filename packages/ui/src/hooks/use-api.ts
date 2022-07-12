import type { LogtoErrorCode } from '@logto/phrases';
import { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useState, useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { PageContext } from '@/hooks/use-page-context';

type UseApi<T extends unknown[], U> = {
  result?: U;
  error: RequestErrorBody | undefined;
  run: (...args: T) => Promise<U | undefined>;
};

export type ErrorHandlers = {
  [key in LogtoErrorCode]?: (error: RequestErrorBody) => void;
} & {
  global?: (error: RequestErrorBody) => void; // Overwrite default global error handle logic
  callback?: (error: RequestErrorBody) => void; // Callback method
};

function useApi<Args extends unknown[], Response>(
  api: (...args: Args) => Promise<Response>,
  errorHandlers?: ErrorHandlers
): UseApi<Args, Response> {
  const { t } = useTranslation();
  const [error, setError] = useState<RequestErrorBody>();
  const [result, setResult] = useState<Response>();

  const { setLoading, setToast } = useContext(PageContext);

  const parseError = useCallback(
    async (error: unknown) => {
      if (error instanceof HTTPError) {
        try {
          const kyError = await error.response.json<RequestErrorBody>();
          setError(kyError);
        } catch {
          setToast(t('error.unknown'));
          console.log(error);
        }

        return;
      }

      setToast(t('error.unknown'));
      console.log(error);
    },
    [setToast, t]
  );

  const run = useCallback(
    async (...args: Args) => {
      setLoading(true);
      // eslint-disable-next-line unicorn/no-useless-undefined
      setError(undefined);

      try {
        const result = await api(...args);
        setResult(result);

        return result;
      } catch (error: unknown) {
        void parseError(error);
      } finally {
        setLoading(false);
      }
    },
    [api, parseError, setLoading]
  );

  useEffect(() => {
    if (!error) {
      return;
    }

    const { code, message } = error;
    const handler = errorHandlers?.[code] ?? errorHandlers?.global;

    errorHandlers?.callback?.(error);

    if (handler) {
      handler(error);

      return;
    }

    setToast(message);
  }, [error, errorHandlers, setToast, t]);

  return {
    error,
    result,
    run,
  };
}

export default useApi;
