import { RedisCache } from '#src/caches/redis-cache.js';
import { MemoryCache } from '#src/caches/memory-cache.js';
import { EnvSet } from '#src/env-set/index.js';
import { CacheStore } from '#src/caches/types.js';

function initCache() {
  let _cacheStore: CacheStore;
  return () => {
    if (_cacheStore) {
      return _cacheStore;
    }

    const { redisUrl } = EnvSet.values;

    if (redisUrl) {
      _cacheStore = new RedisCache();
    } else {
      _cacheStore = new MemoryCache();
    }

    return _cacheStore;
  };
}

export const cacheStore = initCache()();
