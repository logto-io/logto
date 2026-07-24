import { ServiceConnector } from '@logto/connector-kit';
import { type ConnectorResponse } from '@logto/schemas';
import { useContext } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

/**
 * SWR cache key for the per-tenant hosted-email usage endpoint. Exported so the connector test
 * can revalidate it after a send consumes quota.
 */
export const getHostedEmailUsageKey = (tenantId: string) =>
  `/api/tenants/${tenantId}/subscription/hosted-email-usage`;

/**
 * Fetches the per-tenant daily and monthly hosted-email usage and limits (Cloud only). Shared by
 * the Connector Details usage card and the cap notices — SWR dedupes the request so both consumers
 * hit the endpoint once.
 *
 * The cap only applies to Logto's built-in email connector, so the usage request is skipped for
 * tenants on their own email provider — leaving `data` undefined, which also hides the cap notices.
 */
const useHostedEmailUsage = () => {
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi({ hideErrorToast: true });

  const isEnabled = isCloud;

  // Only tenants using the built-in email connector are subject to the cap. Read it from the shared
  // `api/connectors` SWR cache (fetched only while the feature is enabled).
  const { data: connectors } = useSWR<ConnectorResponse[]>(isEnabled && 'api/connectors');
  const isLogtoEmailConnectorInUse =
    connectors?.some((connector) => connector.connectorId === ServiceConnector.Email) ?? false;

  const { data } = useSWR(
    isEnabled &&
      isLogtoEmailConnectorInUse &&
      currentTenantId &&
      getHostedEmailUsageKey(currentTenantId),
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription/hosted-email-usage', {
        params: { tenantId: currentTenantId },
      })
  );

  return { isEnabled, data };
};

export default useHostedEmailUsage;
