import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type Subscription } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';

const useSubscription = (tenantId: string) => {
  const cloudApi = useCloudApi();
  return useSWR<Subscription, Error>(
    // `tenantId` could be an empty string which may cause the request to fail
    isCloud && tenantId && `/api/tenants/${tenantId}/subscription`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription', {
        params: { tenantId },
      })
  );
};

export default useSubscription;
