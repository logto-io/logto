import { type SubscriptionCountBasedUsage } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';

import { type SubscriptionUsageOptions } from './types';

/* === For new pricing model === */
const isSubscriptionUsageWithInLimit = <T extends keyof SubscriptionCountBasedUsage>(
  { quotaKey, subscriptionUsage, subscriptionQuota, usage }: SubscriptionUsageOptions<T>,
  inclusive = true
) => {
  // No limitations for OSS version
  if (!isCloud) {
    return true;
  }

  /**
   * Sometimes we need to manually retrieve usage to overwrite the usage in subscriptionUsage.
   * For example, for the usage of `scopesPerResourceLimit`, `subscriptionUsage.scopesPerResourceLimit` records the largest value among all resource scopes.
   * However, when operating on resources in practice, we need to know the specific usage of scopes for the current resource. In this case, we need to manually calculate the value of scopes for the current resource before calling the function.
   */
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

export const hasSurpassedSubscriptionQuotaLimit = <T extends keyof SubscriptionCountBasedUsage>(
  options: SubscriptionUsageOptions<T>
) => !isSubscriptionUsageWithInLimit(options);

export const hasReachedSubscriptionQuotaLimit = <T extends keyof SubscriptionCountBasedUsage>(
  options: SubscriptionUsageOptions<T>
) => !isSubscriptionUsageWithInLimit(options, false);
/* === For new pricing model === */
