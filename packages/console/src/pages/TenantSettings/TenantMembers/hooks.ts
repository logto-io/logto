import { useContext, useMemo } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import {
  hasReachedSubscriptionQuotaLimit,
  hasSurpassedSubscriptionQuotaLimit,
} from '@/utils/quota';

const useTenantMembersUsage = () => {
  const { currentSubscriptionUsage, currentSubscriptionQuota } =
    useContext(SubscriptionDataContext);

  const usage = useMemo(() => {
    return currentSubscriptionUsage.tenantMembersLimit;
  }, [currentSubscriptionUsage.tenantMembersLimit]);

  const hasTenantMembersReachedLimit = useMemo(
    () =>
      hasReachedSubscriptionQuotaLimit({
        quotaKey: 'tenantMembersLimit',
        quota: currentSubscriptionQuota,
        usage: currentSubscriptionUsage.tenantMembersLimit,
      }),
    [currentSubscriptionQuota, currentSubscriptionUsage.tenantMembersLimit]
  );

  const hasTenantMembersSurpassedLimit = useMemo(
    () =>
      hasSurpassedSubscriptionQuotaLimit({
        quotaKey: 'tenantMembersLimit',
        quota: currentSubscriptionQuota,
        usage: currentSubscriptionUsage.tenantMembersLimit,
      }),
    [currentSubscriptionQuota, currentSubscriptionUsage.tenantMembersLimit]
  );

  return {
    hasTenantMembersReachedLimit,
    hasTenantMembersSurpassedLimit,
    usage,
    limit: currentSubscriptionQuota.tenantMembersLimit ?? Number.POSITIVE_INFINITY,
  };
};

export default useTenantMembersUsage;
