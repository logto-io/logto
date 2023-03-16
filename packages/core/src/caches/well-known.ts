import { TtlCache } from '@logto/shared';
import type { AnyAsyncFunction } from 'p-memoize';
import pMemoize from 'p-memoize';

const cacheKeys = Object.freeze(['sie', 'sie-full', 'phrases', 'phrases-lng-tags'] as const);

/** Well-known data type key for cache. */
export type WellKnownCacheKey = (typeof cacheKeys)[number];

const buildKey = (tenantId: string, key: WellKnownCacheKey) => `${tenantId}:${key}` as const;

class WellKnownCache {
  #cache = new TtlCache<string, unknown>(180_000 /* 3 minutes */);

  /**
   * Use for centralized well-known data caching.
   *
   * WARN:
   * - You should store only well-known (public) data since it's a central cache.
   * - The cache does not guard types.
   */
  use<FunctionToMemoize extends AnyAsyncFunction>(
    tenantId: string,
    key: WellKnownCacheKey,
    run: FunctionToMemoize
  ) {
    return pMemoize(run, {
      cacheKey: () => buildKey(tenantId, key),
      // Trust cache value type
      // eslint-disable-next-line no-restricted-syntax
      cache: this.#cache as TtlCache<string, Awaited<ReturnType<FunctionToMemoize>>>,
    });
  }

  invalidate(tenantId: string, keys: readonly WellKnownCacheKey[]) {
    for (const key of keys) {
      this.#cache.delete(buildKey(tenantId, key));
    }
  }

  invalidateAll(tenantId: string) {
    this.invalidate(tenantId, cacheKeys);
  }

  set(tenantId: string, key: WellKnownCacheKey, value: unknown) {
    this.#cache.set(buildKey(tenantId, key), value);
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
