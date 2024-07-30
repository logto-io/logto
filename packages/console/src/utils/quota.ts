import { type NewSubscriptionQuota } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { type SubscriptionPlan, type SubscriptionPlanQuota } from '@/types/subscriptions';

/** @deprecated */
type UsageOptions = {
  quotaKey: keyof SubscriptionPlanQuota;
  usage: number;
  plan: SubscriptionPlan;
};

/** @deprecated */
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

/** @deprecated */
export const hasSurpassedQuotaLimit = (options: UsageOptions) => !isUsageWithInLimit(options);

/** @deprecated */
export const hasReachedQuotaLimit = (options: UsageOptions) => !isUsageWithInLimit(options, false);

/* === For new pricing model === */
type SubscriptionUsageOptions = {
  quotaKey: keyof NewSubscriptionQuota;
  usage: number;
  quota: NewSubscriptionQuota;
};

const isSubscriptionUsageWithInLimit = (
  { quotaKey, usage, quota }: SubscriptionUsageOptions,
  inclusive = true
) => {
  // No limitations for OSS version
  if (!isCloud) {
    return true;
  }

  const quotaValue = quota[quotaKey];

  // Unlimited
  if (quotaValue === null) {
    return true;
  }

  if (typeof quotaValue === 'boolean') {
    return quotaValue;
  }

  return inclusive ? usage <= quotaValue : usage < quotaValue;
};

export const hasSurpassedSubscriptionQuotaLimit = (options: SubscriptionUsageOptions) =>
  !isSubscriptionUsageWithInLimit(options);

export const hasReachedSubscriptionQuotaLimit = (options: SubscriptionUsageOptions) =>
  !isSubscriptionUsageWithInLimit(options, false);
/* === For new pricing model === */
