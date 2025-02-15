import { useContext } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

const useApiResourcesUsage = () => {
  const { hasReachedSubscriptionQuotaLimit, hasSurpassedSubscriptionQuotaLimit } =
    useContext(SubscriptionDataContext);

  const hasReachedLimit = hasReachedSubscriptionQuotaLimit('resourcesLimit');

  const hasSurpassedLimit = hasSurpassedSubscriptionQuotaLimit('resourcesLimit');

  return {
    hasReachedLimit,
    hasSurpassedLimit,
  };
};

export default useApiResourcesUsage;
