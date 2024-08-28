import { isCloud } from '@/consts/env';
import { type SubscriptionPlan, type SubscriptionPlanQuota } from '@/types/subscriptions';

type UsageOptions = {
  quotaKey: keyof SubscriptionPlanQuota;
  usage: number;
  plan: SubscriptionPlan;
};

const isUsageWithInLimit = ({ quotaKey, usage, plan }: UsageOptions, inclusive = true) => {
  // No limitations for OSS version
  if (!isCloud) {
    return true;
  }

  const quotaValue = plan.quota[quotaKey];

  // Unlimited
  if (quotaValue === null) {
    return true;
  }

  if (typeof quotaValue === 'boolean') {
    return quotaValue;
  }

  return inclusive ? usage <= quotaValue : usage < quotaValue;
};

export const hasSurpassedQuotaLimit = (options: UsageOptions) => !isUsageWithInLimit(options);

export const hasReachedQuotaLimit = (options: UsageOptions) => !isUsageWithInLimit(options, false);
