import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type Subscription } from '@/cloud/types/router';
import { isCloud, isProduction } from '@/consts/env';

const useSubscription = (tenantId: string) => {
  const cloudApi = useCloudApi();
  return useSWR<Subscription, Error>(
    /**
     * Todo: @xiaoyijun remove this condition on subscription features ready.
     */
    !isProduction && isCloud && `/api/tenants/${tenantId}/subscription`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription', {
        params: { tenantId },
      })
  );
};

export default useSubscription;
