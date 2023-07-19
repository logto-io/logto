import { useContext } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type Subscription } from '@/cloud/types/router';
import { isCloud, isProduction } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

const useCurrentSubscription = () => {
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi();
  return useSWR<Subscription, Error>(
    /**
     * Todo: @xiaoyijun remove this condition on subscription features ready.
     */
    !isProduction && isCloud && `/api/tenants/${currentTenantId}/subscription`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription', {
        params: { tenantId: currentTenantId },
      })
  );
};

export default useCurrentSubscription;
