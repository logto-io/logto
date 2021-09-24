import { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useState } from 'react';

type UseApi<T extends any[], U> = {
  result?: U;
  loading: boolean;
  error: RequestErrorBody | null;
  run: (...args: T) => Promise<void>;
};

function useApi<Args extends any[], Response>(
  api: (...args: Args) => Promise<Response>
): UseApi<Args, Response> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestErrorBody | null>(null);
  const [result, setResult] = useState<Response>();

  const run = async (...args: Args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api(...args);
      setResult(result);
      setLoading(false);
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const kyError = await error.response.json<RequestErrorBody>();
        setError(kyError);
        setLoading(false);
        return;
      }

      setLoading(false);
      throw error;
    }
  };

  return {
    loading,
    error,
    result,
    run,
  };
}

export default useApi;
