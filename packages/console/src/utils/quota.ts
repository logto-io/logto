import { type NewSubscriptionQuota } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';

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
