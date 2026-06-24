import { type Optional } from '@silverhand/essentials';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type LogtoSkuResponse } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import TenantAccess from '@/containers/TenantAccess';
// eslint-disable-next-line unused-imports/no-unused-imports -- for jsDoc use
import type { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { LogtoSkuType } from '@/types/skus';
import { formatLogtoSkusResponses } from '@/utils/subscription';

/**
 * Fetch public Logto SKUs from the cloud API.
 *
 * @remarks
 * Note: This hook is used for retrieving public available Logto SKUs for all the users.
 * If you want to retrieve tenant specific available Logto SKUs under the {@link TenantAccess} component,
 * e.g. For enterprise tenant who have their own private SKUs, and all grandfathered plan tenants,
 * use the logtoSkus from the {@link SubscriptionDataContext} instead.
 */
const useLogtoSkus = () => {
  const cloudApi = useCloudApi();

  const useSwrResponse = useSWRImmutable<LogtoSkuResponse[], Error>(
    isCloud && '/api/skus',
    async () =>
      cloudApi.get('/api/skus', {
        search: { type: LogtoSkuType.Basic },
      })
  );

  const { data: logtoSkuResponse } = useSwrResponse;

  const logtoSkus: Optional<LogtoSkuResponse[]> = useMemo(
    () => formatLogtoSkusResponses(logtoSkuResponse),
    [logtoSkuResponse]
  );

  return {
    ...useSwrResponse,
    data: logtoSkus,
  };
};

export default useLogtoSkus;
