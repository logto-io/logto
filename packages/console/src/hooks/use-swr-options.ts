import { SWRConfiguration } from 'swr';

import { RequestError } from './use-api';
import useSwrFetcher from './use-swr-fetcher';

const useSwrOptions = (): SWRConfiguration => {
  const fetcher = useSwrFetcher();

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
