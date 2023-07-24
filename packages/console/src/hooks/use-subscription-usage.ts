import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type SubscriptionUsage } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';

const useSubscriptionUsage = (tenantId: string) => {
  const cloudApi = useCloudApi();

  return useSWR<SubscriptionUsage, Error>(isCloud && `/api/tenants/${tenantId}/usage`, async () =>
    cloudApi.get('/api/tenants/:tenantId/usage', {
      params: { tenantId },
    })
  );
};

export default useSubscriptionUsage;
