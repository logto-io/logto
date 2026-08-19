import { type CimdConfig } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

export const cimdConfigEndpoint = 'api/configs/cimd';

/** The dynamic app (CIMD) is a tenant-level feature switch rather than an application entity. */
const useDynamicApp = (shouldFetch = true) => {
  const { data, error, mutate } = useSWR<CimdConfig, RequestError>(
    conditional(shouldFetch && cimdConfigEndpoint)
  );

  return {
    enabled: Boolean(data?.enabled),
    isLoading: shouldFetch && !data && !error,
    error,
    mutate,
  };
};

export default useDynamicApp;
