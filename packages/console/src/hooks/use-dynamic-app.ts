import { type CimdConfig } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import useSWR from 'swr';

import { isDevFeaturesEnabled } from '@/consts/env';
import { type RequestError } from '@/hooks/use-api';

export const cimdConfigEndpoint = 'api/configs/cimd';

/** The dynamic app (CIMD) is a tenant-level feature switch rather than an application entity. */
const useDynamicApp = (shouldFetch = true) => {
  const { data, error } = useSWR<CimdConfig, RequestError>(
    conditional(isDevFeaturesEnabled && shouldFetch && cimdConfigEndpoint)
  );

  return {
    enabled: Boolean(data?.enabled),
    isLoading: isDevFeaturesEnabled && shouldFetch && !data && !error,
  };
};

export default useDynamicApp;
