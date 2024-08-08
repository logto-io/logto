import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type NewSubscriptionQuota } from '@/cloud/types/router';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';

const useNewSubscriptionQuota = (tenantId: string) => {
  // TODO: Console sometimes toast 401 unauthorized error, but can not be reproduced in local environment easily, we temporarily hide the error toast for prod env.
  const cloudApi = useCloudApi({ hideErrorToast: !isDevFeaturesEnabled });

  return useSWR<NewSubscriptionQuota, Error>(
    isCloud && isDevFeaturesEnabled && tenantId && `/api/tenants/${tenantId}/subscription/quota`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription/quota', {
        params: { tenantId },
      })
  );
};

export default useNewSubscriptionQuota;
