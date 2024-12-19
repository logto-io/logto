import { SubscriptionRedisCacheKey } from '@logto/schemas';
import { type ZodType } from 'zod';

import { type Subscription, subscriptionCacheGuard } from '#src/utils/subscription/types.js';

import { BaseCache } from './base-cache.js';

type SubscriptionCacheMap = {
  [SubscriptionRedisCacheKey.Subscription]: Subscription;
};

type SubscriptionCacheType = keyof SubscriptionCacheMap;

function getValueGuard(type: SubscriptionCacheType): ZodType<SubscriptionCacheMap[typeof type]> {
  switch (type) {
    case SubscriptionRedisCacheKey.Subscription: {
      return subscriptionCacheGuard;
    }
  }
}

/**
 * A local region cache for tenant subscription data.
 * We use this cache to reduce the number of requests to the Cloud
 * and improve the performance of subscription-related operations.
 */
export class TenantSubscriptionCache extends BaseCache<SubscriptionCacheMap> {
  name = 'Tenant Subscription';
  getValueGuard = getValueGuard;
}
