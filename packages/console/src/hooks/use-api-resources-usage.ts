import { useContext, useMemo } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import {
  hasReachedSubscriptionQuotaLimit,
  hasSurpassedSubscriptionQuotaLimit,
} from '@/utils/quota';

const useApiResourcesUsage = () => {
  const { currentSubscriptionQuota, currentSubscriptionUsage } =
    useContext(SubscriptionDataContext);

  const hasReachedLimit = useMemo(
    () =>
      hasReachedSubscriptionQuotaLimit({
        quotaKey: 'resourcesLimit',
        usage: currentSubscriptionUsage.resourcesLimit,
        quota: currentSubscriptionQuota,
      }),
    [currentSubscriptionQuota, currentSubscriptionUsage.resourcesLimit]
  );

  const hasSurpassedLimit = useMemo(
    () =>
      hasSurpassedSubscriptionQuotaLimit({
        quotaKey: 'resourcesLimit',
        usage: currentSubscriptionUsage.resourcesLimit,
        quota: currentSubscriptionQuota,
      }),
    [currentSubscriptionQuota, currentSubscriptionUsage.resourcesLimit]
  );

  return {
    hasReachedLimit,
    hasSurpassedLimit,
  };
};

export default useApiResourcesUsage;
