import { type Optional } from '@silverhand/essentials';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type LogtoSkuResponse } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { featuredPlanIdOrder } from '@/consts/subscriptions';
// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import TenantAccess from '@/containers/TenantAccess';
import { LogtoSkuType } from '@/types/skus';
import { sortBy } from '@/utils/sort';
import { addSupportQuota } from '@/utils/subscription';

/**
 * Fetch Logto SKUs from the cloud API.
 * Note: If you want to retrieve Logto SKUs under the {@link TenantAccess} component, use `SubscriptionDataContext` instead.
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

  const logtoSkus: Optional<LogtoSkuResponse[]> = useMemo(() => {
    if (!logtoSkuResponse) {
      return;
    }

    return logtoSkuResponse
      .map((logtoSku) => addSupportQuota(logtoSku))
      .slice()
      .sort(({ id: previousId }, { id: nextId }) =>
        sortBy(featuredPlanIdOrder)(previousId, nextId)
      );
  }, [logtoSkuResponse]);

  return {
    ...useSwrResponse,
    data: logtoSkus,
  };
};

export default useLogtoSkus;
