import type React from 'react';
import { useMemo } from 'react';
import type { SWRConfig } from 'swr';

import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { shouldRetryOnError } from '@/utils/request';

import useTenantApi from './use-tenant-api';

/**
 * A hook to get the SWR options for the current tenant by reading the `:tenantId` param from the
 * route.
 */
const useTenantSwrOptions = (): Partial<React.ComponentProps<typeof SWRConfig>['value']> => {
  const api = useTenantApi();
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

export default useTenantSwrOptions;
