import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type Subscription } from '@/cloud/types/router';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';

const useSubscription = (tenantId: string) => {
  // TODO: Console sometimes toast 401 unauthorized error, but can not be reproduced in local environment easily, we temporarily hide the error toast for prod env.
  const cloudApi = useCloudApi({ hideErrorToast: !isDevFeaturesEnabled });
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
