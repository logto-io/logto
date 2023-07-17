import { useContext } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type Subscription } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

const useCurrentSubscription = () => {
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi();
  const useSwrResponse = useSWR<Subscription, Error>(
    isCloud && `/api/tenants/${currentTenantId}/subscription`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription', {
        params: { tenantId: currentTenantId },
      }),
    /**
     * Note: since the default subscription feature is WIP, we don't want to retry on error.
     * Todo: @xiaoyijun remove this option when the default subscription feature is ready.
     */
    { shouldRetryOnError: false }
  );

  const { data, error } = useSwrResponse;

  return {
    ...useSwrResponse,
    isLoading: !data && !error,
  };
};

export default useCurrentSubscription;
