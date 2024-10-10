import { useContext, useMemo } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

const useTenantMembersUsage = () => {
  const {
    currentSubscriptionUsage,
    currentSubscriptionQuota,
    hasReachedSubscriptionQuotaLimit,
    hasSurpassedSubscriptionQuotaLimit,
  } = useContext(SubscriptionDataContext);

  const usage = useMemo(() => {
    return currentSubscriptionUsage.tenantMembersLimit;
  }, [currentSubscriptionUsage.tenantMembersLimit]);

  const hasTenantMembersReachedLimit = hasReachedSubscriptionQuotaLimit('tenantMembersLimit');

  const hasTenantMembersSurpassedLimit = hasSurpassedSubscriptionQuotaLimit('tenantMembersLimit');

  return {
    hasTenantMembersReachedLimit,
    hasTenantMembersSurpassedLimit,
    usage,
    limit: currentSubscriptionQuota.tenantMembersLimit ?? Number.POSITIVE_INFINITY,
  };
};

export default useTenantMembersUsage;
