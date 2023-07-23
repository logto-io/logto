import { toast } from 'react-hot-toast';
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
      }),
    {
      onError: (error: unknown) => {
        toast.error(error instanceof Error ? error.message : String(error));
      },
    }
  );
};

export default useSubscriptionUsage;
