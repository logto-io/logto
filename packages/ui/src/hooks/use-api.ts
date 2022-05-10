import { LogtoErrorCode } from '@logto/phrases';
import { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useState, useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { PageContext } from '@/hooks/use-page-context';

type UseApi<T extends any[], U> = {
  result?: U;
  error: RequestErrorBody | undefined;
  run: (...args: T) => Promise<U | undefined>;
};

export type ErrorHandlers = {
  [key in LogtoErrorCode]?: (error: RequestErrorBody) => void;
} & {
  global?: (error: RequestErrorBody) => void;
  callback?: (error: RequestErrorBody) => void;
};

function useApi<Args extends any[], Response>(
  api: (...args: Args) => Promise<Response>,
  errorHandlers?: ErrorHandlers
): UseApi<Args, Response> {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const [error, setError] = useState<RequestErrorBody>();
  const [result, setResult] = useState<Response>();

  const { setLoading, setToast } = useContext(PageContext);

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
        if (error instanceof HTTPError && error.response.body) {
          const kyError = await error.response.json<RequestErrorBody>();
          setError(kyError);

          return;
        }

        setToast(t('error.unknown'));
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [api, setLoading, setToast, t]
  );

  useEffect(() => {
    if (!error) {
      return;
    }

    const { code } = error;
    const handler = errorHandlers?.[code] ?? errorHandlers?.global;

    errorHandlers?.callback?.(error);

    if (handler) {
      handler(error);

      return;
    }

    setToast(t('error.request', { ...error }));
  }, [error, errorHandlers, setToast, t]);

  return {
    error,
    result,
    run,
  };
}

export default useApi;
