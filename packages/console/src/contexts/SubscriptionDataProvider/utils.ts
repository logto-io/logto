import { pick } from '@silverhand/essentials';

import { type NewSubscriptionCountBasedUsage } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';

import { type SubscriptionUsageOptions } from './types';

/* === For new pricing model === */
const isSubscriptionUsageWithInLimit = <T extends keyof NewSubscriptionCountBasedUsage>(
  { quotaKey, subscriptionUsage, subscriptionQuota, usage }: SubscriptionUsageOptions<T>,
  inclusive = true
) => {
  // No limitations for OSS version
  if (!isCloud) {
    return true;
  }

  const usageValue = usage ?? subscriptionUsage[quotaKey];
  const quotaValue = subscriptionQuota[quotaKey];

  // Unlimited
  if (quotaValue === null) {
    return true;
  }

  if (typeof quotaValue === 'boolean') {
    return quotaValue;
  }

  return inclusive ? usageValue <= quotaValue : usageValue < quotaValue;
};

export const hasSurpassedSubscriptionQuotaLimit = <T extends keyof NewSubscriptionCountBasedUsage>(
  options: SubscriptionUsageOptions<T>
) => {
  console.log(
    'hasSurpassedSubscriptionQuotaLimit',
    pick(options, 'quotaKey', 'usage', 'subscriptionUsage', 'subscriptionQuota')
  );
  return !isSubscriptionUsageWithInLimit(options);
};

export const hasReachedSubscriptionQuotaLimit = <T extends keyof NewSubscriptionCountBasedUsage>(
  options: SubscriptionUsageOptions<T>
) => {
  console.log(
    'hasReachedSubscriptionQuotaLimit',
    pick(options, 'quotaKey', 'usage', 'subscriptionUsage', 'subscriptionQuota')
  );
  return !isSubscriptionUsageWithInLimit(options, false);
};
/* === For new pricing model === */
