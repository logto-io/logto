import { isManagementApi } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { type ApiResource } from '@/consts';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { hasReachedQuotaLimit } from '@/utils/quota';

import useSubscriptionPlan from './use-subscription-plan';

const useApiResourcesUsage = () => {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  /**
   * Note: we only need to fetch all resources when the user is in cloud environment.
   * The oss version doesn't have the quota limit.
   */
  const { data: allResources } = useSWR<ApiResource[]>(isCloud && 'api/resources');

  const hasReachedLimit = useMemo(() => {
    const resourceCount =
      allResources?.filter(({ indicator }) => !isManagementApi(indicator)).length ?? 0;

    return hasReachedQuotaLimit({
      quotaKey: 'resourcesLimit',
      plan: currentPlan,
      usage: resourceCount,
    });
  }, [allResources, currentPlan]);

  return {
    hasReachedLimit,
  };
};

export default useApiResourcesUsage;
