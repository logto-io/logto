import { useContext } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

/**
 * SWR cache key for the per-tenant hosted-email usage endpoint. Exported so the connector test
 * can revalidate it after a send consumes quota.
 */
export const getHostedEmailUsageKey = (tenantId: string) =>
  `/api/tenants/${tenantId}/subscription/hosted-email-usage`;

/**
 * Fetches the per-tenant daily and monthly hosted-email usage and limits (Cloud + dev-features
 * only). Shared by the Connector Details usage card and the cap notices — SWR dedupes the request
 * so both consumers hit the endpoint once.
 */
const useHostedEmailUsage = () => {
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi({ hideErrorToast: true });

  const isEnabled = isCloud && isDevFeaturesEnabled;
  const { data } = useSWR(
    isEnabled && currentTenantId && getHostedEmailUsageKey(currentTenantId),
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription/hosted-email-usage', {
        params: { tenantId: currentTenantId },
      })
  );

  return { isEnabled, data };
};

export default useHostedEmailUsage;
