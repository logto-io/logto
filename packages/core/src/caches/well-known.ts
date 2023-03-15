import Keyv from 'keyv';
import type { AnyAsyncFunction } from 'p-memoize';
import pMemoize from 'p-memoize';

const cacheKeys = Object.freeze(['sie', 'sie-full', 'phrases', 'phrases-lng-tags'] as const);

/** Well-known data type key for cache. */
export type WellKnownCacheKey = (typeof cacheKeys)[number];

const buildKey = (tenantId: string, key: WellKnownCacheKey) => `${tenantId}:${key}` as const;

class WellKnownCache {
  // Not sure if we need guard value for `.has()` and `.get()`,
  // trust cache value for now.
  #keyv = new Keyv({ ttl: 180_000 /* 3 minutes */ });

  /**
   * Use for centralized well-known data caching.
   *
   * WARN: You should store only well-known (public) data since it's a central cache.
   */
  use<FunctionToMemoize extends AnyAsyncFunction>(
    tenantId: string,
    key: WellKnownCacheKey,
    run: FunctionToMemoize
  ) {
    return pMemoize(run, {
      cacheKey: () => buildKey(tenantId, key),
      cache: this.#keyv,
    });
  }

  async invalidate(tenantId: string, keys: readonly WellKnownCacheKey[]) {
    return this.#keyv.delete(keys.map((key) => buildKey(tenantId, key)));
  }

  async invalidateAll(tenantId: string) {
    return this.invalidate(tenantId, cacheKeys);
  }

  async set(tenantId: string, key: WellKnownCacheKey, value: unknown) {
    return this.#keyv.set(buildKey(tenantId, key), value);
  }
}

/**
 * The central TTL cache for well-known data. The default TTL is 3 minutes.
 *
 * This cache is intended for public APIs that are tolerant for data freshness.
 * For Management APIs, you should use uncached functions instead.
 *
 * WARN: You should store only well-known (public) data since it's a central cache.
 */
export const wellKnownCache = new WellKnownCache();
