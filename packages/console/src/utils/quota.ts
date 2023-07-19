import { isCloud, isProduction } from '@/consts/env';
import { type SubscriptionPlan, type SubscriptionPlanQuota } from '@/types/subscriptions';

type IsOverQuotaParameters = {
  quotaKey: keyof SubscriptionPlanQuota;
  usage: number;
  plan?: SubscriptionPlan;
};

export const isOverQuota = ({ quotaKey, usage, plan }: IsOverQuotaParameters) => {
  /**
   * Todo: @xiaoyijun remove this condition on subscription features ready.
   */
  if (isProduction || !isCloud) {
    return false;
  }

  // If the plan is not loaded, guarded by backend APIs
  if (!plan) {
    return false;
  }

  const quotaValue = plan.quota[quotaKey];

  // Unlimited
  if (quotaValue === null) {
    return false;
  }

  if (typeof quotaValue === 'boolean') {
    return !quotaValue;
  }

  return usage >= quotaValue;
};
