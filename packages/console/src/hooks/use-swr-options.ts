import type React from 'react';
import { useMemo } from 'react';
import type { SWRConfig } from 'swr';

import { shouldRetryOnError } from '@/utils/request';

import useApi from './use-api';
import useSwrFetcher from './use-swr-fetcher';

const useSwrOptions = (): Partial<React.ComponentProps<typeof SWRConfig>['value']> => {
  const api = useApi();
  const fetcher = useSwrFetcher(api);

  const config = useMemo(
    () => ({
      fetcher,
      shouldRetryOnError: shouldRetryOnError({ ignore: [401, 403] }),
    }),
    [fetcher]
  );
  return config;
};

export default useSwrOptions;
