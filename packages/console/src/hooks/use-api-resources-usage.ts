import { isManagementApi } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { type ApiResource } from '@/consts';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { hasReachedQuotaLimit, hasSurpassedQuotaLimit } from '@/utils/quota';

const useApiResourcesUsage = () => {
  const { currentPlan } = useContext(SubscriptionDataContext);
  const { currentTenantId } = useContext(TenantsContext);
  /**
   * Note: we only need to fetch all resources when the user is in cloud environment.
   * The oss version doesn't have the quota limit.
   */
  const { data: allResources } = useSWR<ApiResource[]>(isCloud && 'api/resources');

  const resourceCount = useMemo(
    () =>
      allResources?.filter(({ indicator }) => !isManagementApi(currentTenantId, indicator))
        .length ?? 0,
    [allResources, currentTenantId]
  );

  const hasReachedLimit = useMemo(
    () =>
      hasReachedQuotaLimit({
        quotaKey: 'resourcesLimit',
        plan: currentPlan,
        usage: resourceCount,
      }),
    [currentPlan, resourceCount]
  );

  const hasSurpassedLimit = useMemo(
    () =>
      hasSurpassedQuotaLimit({
        quotaKey: 'resourcesLimit',
        plan: currentPlan,
        usage: resourceCount,
      }),
    [currentPlan, resourceCount]
  );

  return {
    hasReachedLimit,
    hasSurpassedLimit,
  };
};

export default useApiResourcesUsage;
