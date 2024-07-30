import { isManagementApi } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { type ApiResource } from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import {
  hasReachedQuotaLimit,
  hasReachedSubscriptionQuotaLimit,
  hasSurpassedQuotaLimit,
  hasSurpassedSubscriptionQuotaLimit,
} from '@/utils/quota';

const useApiResourcesUsage = () => {
  const { currentPlan, currentSubscriptionQuota, currentSubscriptionUsage } =
    useContext(SubscriptionDataContext);

  /**
   * Note: we only need to fetch all resources when the user is in cloud environment.
   * The oss version doesn't have the quota limit.
   */
  const { data: allResources } = useSWR<ApiResource[]>(isCloud && 'api/resources');

  const resourceCount = useMemo(
    () =>
      isDevFeaturesEnabled
        ? currentSubscriptionUsage.resourcesLimit
        : allResources?.filter(({ indicator }) => !isManagementApi(indicator)).length ?? 0,
    [allResources, currentSubscriptionUsage.resourcesLimit]
  );

  const hasReachedLimit = useMemo(
    () =>
      isDevFeaturesEnabled
        ? hasReachedSubscriptionQuotaLimit({
            quotaKey: 'resourcesLimit',
            usage: currentSubscriptionUsage.resourcesLimit,
            quota: currentSubscriptionQuota,
          })
        : hasReachedQuotaLimit({
            quotaKey: 'resourcesLimit',
            plan: currentPlan,
            usage: resourceCount,
          }),
    [currentPlan, resourceCount, currentSubscriptionQuota, currentSubscriptionUsage.resourcesLimit]
  );

  const hasSurpassedLimit = useMemo(
    () =>
      isDevFeaturesEnabled
        ? hasSurpassedSubscriptionQuotaLimit({
            quotaKey: 'resourcesLimit',
            usage: currentSubscriptionUsage.resourcesLimit,
            quota: currentSubscriptionQuota,
          })
        : hasSurpassedQuotaLimit({
            quotaKey: 'resourcesLimit',
            plan: currentPlan,
            usage: resourceCount,
          }),
    [currentPlan, resourceCount, currentSubscriptionQuota, currentSubscriptionUsage.resourcesLimit]
  );

  return {
    hasReachedLimit,
    hasSurpassedLimit,
  };
};

export default useApiResourcesUsage;
