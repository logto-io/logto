import { type UserAssetsServiceStatus } from '@logto/schemas';
import useSWRImmutable from 'swr/immutable';

import { type RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';

import useTenantApi from './use-tenant-api';

/**
 * A hook to check if the current tenant's user assets service is ready. The tenant ID is read from
 * `:tenantId` param in the route.
 */
const useTenantUserAssetsService = () => {
  const api = useTenantApi();
  const fetcher = useSwrFetcher<UserAssetsServiceStatus>(api);
  const { data, error } = useSWRImmutable<UserAssetsServiceStatus, RequestError>(
    'api/user-assets/service-status',
    fetcher
  );

  return {
    isReady: data?.status === 'ready',
    isLoading: !error && !data,
  };
};

export default useTenantUserAssetsService;
