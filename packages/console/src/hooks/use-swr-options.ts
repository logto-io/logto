import type { SWRConfiguration } from 'swr';

import useApi, { RequestError } from './use-api';
import useSwrFetcher from './use-swr-fetcher';

const useSwrOptions = (): SWRConfiguration => {
  const api = useApi();
  const fetcher = useSwrFetcher(api);

  return {
    fetcher,
    shouldRetryOnError: (error: unknown) => {
      if (error instanceof RequestError) {
        const { status } = error;

        return status !== 401 && status !== 403;
      }

      return true;
    },
  };
};

export default useSwrOptions;
