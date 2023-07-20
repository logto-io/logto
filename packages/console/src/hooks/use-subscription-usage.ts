import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type SubscriptionUsage } from '@/cloud/types/router';
import { isCloud, isProduction } from '@/consts/env';

const useSubscriptionUsage = (tenantId: string) => {
  const cloudApi = useCloudApi();

  return useSWR<SubscriptionUsage, Error>(
    /**
     * Todo: @xiaoyijun remove this condition on subscription features ready.
     */
    !isProduction && isCloud && `/api/tenants/${tenantId}/usage`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/usage', {
        params: { tenantId },
      })
  );
};

export default useSubscriptionUsage;
