import { SubscriptionRedisCacheKey } from '@logto/schemas';
import { TtlCache } from '@logto/shared';

import { TenantSubscriptionCache } from '#src/caches/tenant-subscription.js';
import { type CacheStore } from '#src/caches/types.js';
import { cacheConsole } from '#src/caches/utils.js';
import { type TokenUsageCounts, tokenUsageCountsGuard } from '#src/queries/daily-token-usage.js';
import type Queries from '#src/tenants/Queries.js';
import { getTenantSubscription } from '#src/utils/subscription/index.js';
import { type Subscription } from '#src/utils/subscription/types.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';

const maxSubscriptionCacheTtl = 24 * 60 * 60; // 24 hours in seconds

/**
 * Return the expiration time of the subscription cache in seconds.
 *
 * @param currentPeriodEnd The end date of the current subscription period.
 */
const getSubscriptionCacheExpiration = (currentPeriodEnd: string) => {
  const expiration = Math.floor((new Date(currentPeriodEnd).getTime() - Date.now()) / 1000);
  // Make sure the expiration is not less than 0 (in case the subscription period has already ended) and not greater than `maxSubscriptionCacheTtl`
  return Math.min(Math.max(expiration, 0), maxSubscriptionCacheTtl);
};

const tokenUsageCacheTtl = 60 * 60 * 1000; // 1 hour in milliseconds
/**
 *
 * @param to The end date of the token usage period.
 *
 * @returns The TTL for the token usage cache in milliseconds.
 *
 * @remarks
 * - A maximum TTL of 1 hour is set for the token usage cache.
 * - If the token usage period ends is more than an hour from now, the TTL will be 1 hour.
 * - If the token usage period ends is less than an hour from now, the TTL will be the difference between the end date and now.
 * - This is to ensure that the cache is invalidated immediately after the token usage period ends.
 */
const getTokenUsageCacheTtl = (to: Date) => {
  const expiration = Math.floor(to.getTime() - Date.now());
  return Math.min(expiration, tokenUsageCacheTtl);
};

export class SubscriptionLibrary {
  /**
   * Get the subscription data for the tenant with caching.
   *
   * @remarks
   * This method will retrieve the subscription data (without usages) from the Cloud service
   * with redis caching.
   *
   * - The cache will be automatically invalidated when the subscription period ends.
   * - Any tenant subscription updates at the Cloud service side will also invalidate the cache.
   */
  public readonly getSubscriptionData: () => Promise<Subscription>;

  /**
   * Tenant subscription data redis cache.
   */
  private readonly subscriptionCache;

  /**
   * Tenant token usage TtlCache
   * We use this to reduce the token usage calculation queries.
   * Each token request will trigger a token usage validation.
   * We don't want to calculate the latest token usage for each request.
   * Using this cache, we can reduce the number of queries to the database.
   */
  private readonly tokenUsageCache = new TtlCache<string, TokenUsageCounts>(tokenUsageCacheTtl);

  constructor(
    public readonly tenantId: string,
    public readonly queries: Queries,
    public readonly cloudConnection: CloudConnectionLibrary,
    cache: CacheStore
  ) {
    this.subscriptionCache = new TenantSubscriptionCache(tenantId, cache);

    this.getSubscriptionData = this.subscriptionCache.memoize(
      async () => getTenantSubscription(this.cloudConnection),
      [SubscriptionRedisCacheKey.Subscription],
      ({ currentPeriodEnd }) => getSubscriptionCacheExpiration(currentPeriodEnd)
    );
  }

  /**
   * Get the tenant token usage for the given period.
   * This method will use the local TTL cache to reduce the number of queries to the database.
   * The cache will be invalidated every hour.
   */
  public async getTenantTokenUsage({ from, to }: { from: Date; to: Date }) {
    const cacheKey = this.buildTokenUsageKey({ tenantId: this.tenantId, from, to });
    const cachedValue = this.tokenUsageCache.get(cacheKey);

    if (cachedValue !== undefined) {
      cacheConsole.info(`Tenant token usage TTL cache hit for: ${cacheKey}`);
      return cachedValue;
    }

    const tokenUsageCounts = await this.queries.dailyTokenUsage.countTokenUsage({
      from,
      to,
    });
    const result = tokenUsageCountsGuard.safeParse(tokenUsageCounts);
    if (!result.success) {
      throw new Error(
        `Invalid token usage counts data retrieved for tenant ${this.tenantId}: ${result.error.message}`
      );
    }

    this.tokenUsageCache.set(cacheKey, result.data, getTokenUsageCacheTtl(to));
    return result.data;
  }

  private buildTokenUsageKey({ tenantId, from, to }: { tenantId: string; from: Date; to: Date }) {
    return `${tenantId}:${from.toISOString().split('T')[0]}:${
      to.toISOString().split('T')[0]
    }:token-usage`;
  }
}
