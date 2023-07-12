import { useContext } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type SubscriptionUsage } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

const useCurrentSubscriptionUsage = () => {
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi();

  return useSWR<SubscriptionUsage, Error>(
    isCloud && `/api/tenants/${currentTenantId}/usage`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/usage', {
        params: { tenantId: currentTenantId },
      })
  );
};

export default useCurrentSubscriptionUsage;
