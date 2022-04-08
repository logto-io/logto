import { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useState, useCallback, useContext } from 'react';

import PageContext from '@/hooks/page-context';

type UseApi<T extends any[], U> = {
  result?: U;
  error: RequestErrorBody | undefined;
  run: (...args: T) => Promise<void>;
};

function useApi<Args extends any[], Response>(
  api: (...args: Args) => Promise<Response>
): UseApi<Args, Response> {
  const [error, setError] = useState<RequestErrorBody>();
  const [result, setResult] = useState<Response>();

  const { setLoading } = useContext(PageContext);

  const run = useCallback(
    async (...args: Args) => {
      setLoading(true);
      // eslint-disable-next-line unicorn/no-useless-undefined
      setError(undefined);

      try {
        const result = await api(...args);
        setResult(result);
      } catch (error: unknown) {
        if (error instanceof HTTPError && error.response.body) {
          const kyError = await error.response.json<RequestErrorBody>();
          setError(kyError);

          return;
        }

        // TODO: handle unknown server error
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api, setLoading]
  );

  return {
    error,
    result,
    run,
  };
}

export default useApi;
