import type React from 'react';
import { useMemo } from 'react';
import type { SWRConfig } from 'swr';

import useApi, { RequestError } from './use-api';
import useSwrFetcher from './use-swr-fetcher';

const useSwrOptions = (): Partial<React.ComponentProps<typeof SWRConfig>['value']> => {
  const api = useApi();
  const fetcher = useSwrFetcher(api);

  const config = useMemo(
    () => ({
      fetcher,
      shouldRetryOnError: (error: unknown) => {
        if (error instanceof RequestError) {
          const { status } = error;

          return status !== 401 && status !== 403;
        }

        return true;
      },
    }),
    [fetcher]
  );
  return config;
};

export default useSwrOptions;
