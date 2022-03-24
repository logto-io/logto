import { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useState, useCallback } from 'react';

type UseApi<T extends any[], U> = {
  result?: U;
  loading: boolean;
  error: RequestErrorBody | undefined;
  run: (...args: T) => Promise<void>;
};

function useApi<Args extends any[], Response>(
  api: (...args: Args) => Promise<Response>
): UseApi<Args, Response> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestErrorBody>();
  const [result, setResult] = useState<Response>();

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
    [api]
  );

  return {
    loading,
    error,
    result,
    run,
  };
}

export default useApi;
