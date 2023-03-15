import Keyv from 'keyv';
import type { AnyAsyncFunction } from 'p-memoize';
import pMemoize from 'p-memoize';

const cacheKeys = Object.freeze(['sie', 'sie-full', 'phrases', 'lng-tags'] as const);

/** Well-known data type key for cache. */
export type WellKnownCacheKey = (typeof cacheKeys)[number];

// Not sure if we need guard value for `.has()` and `.get()`,
// trust cache value for now.
const wellKnownCache = new Keyv({ ttl: 300_000 /* 5 minutes */ });

/**
 * Use for centralized well-known data caching.
 *
 * WARN: You should store only well-known (public) data since it's a central cache.
 */
export const useWellKnownCache = <FunctionToMemoize extends AnyAsyncFunction>(
  tenantId: string,
  key: WellKnownCacheKey,
  run: FunctionToMemoize
) =>
  pMemoize(run, {
    cacheKey: () => `${tenantId}:${key}`,
    cache: wellKnownCache,
  });

export const invalidateWellKnownCache = async (tenantId: string) =>
  wellKnownCache.delete(cacheKeys.map((key) => `${tenantId}:${key}` as const));
