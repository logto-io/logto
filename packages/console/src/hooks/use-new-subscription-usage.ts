import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type NewSubscriptionUsage } from '@/cloud/types/router';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';

const useNewSubscriptionUsage = (tenantId: string) => {
  // TODO: Console sometimes toast 401 unauthorized error, but can not be reproduced in local environment easily, we temporarily hide the error toast for prod env.
  const cloudApi = useCloudApi({ hideErrorToast: !isDevFeaturesEnabled });

  return useSWR<NewSubscriptionUsage, Error>(
    isCloud && isDevFeaturesEnabled && tenantId && `/api/tenants/${tenantId}/subscription/usage`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription/usage', {
        params: { tenantId },
      })
  );
};

export default useNewSubscriptionUsage;
