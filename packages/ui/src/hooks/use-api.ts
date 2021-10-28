import { RequestErrorBody } from '@logto/schemas';
import axios, { AxiosResponse } from 'axios';
import { useState } from 'react';

type UseApi<T extends any[], U> = {
  result?: U;
  loading: boolean;
  error: RequestErrorBody | null;
  run: (...args: T) => Promise<void>;
};

function useApi<Args extends any[], Response>(
  api: (...args: Args) => Promise<AxiosResponse<Response>>
): UseApi<Args, Response> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestErrorBody | null>(null);
  const [result, setResult] = useState<Response>();

  const run = async (...args: Args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api(...args);
      setResult(result.data);
      setLoading(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        // TODO: need a proper way to assert the response type of axios error
        setError(error.response.data as RequestErrorBody);
        setLoading(false);
        return;
      }

      // Throw request error, unknown error
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
