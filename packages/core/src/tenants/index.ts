import { LRUCache } from 'lru-cache';

import { redisCache } from '#src/caches/index.js';
import { WellKnownCache } from '#src/caches/well-known.js';
import { EnvSet } from '#src/env-set/index.js';
import { consoleLog } from '#src/utils/console.js';

import Tenant from './Tenant.js';

export class TenantPool {
  protected cache = new LRUCache<string, Promise<Tenant>>({
    max: EnvSet.values.tenantPoolSize,
    dispose: async (entry) => {
      const tenant = await entry;
      void tenant.dispose();
    },
  });

  async get(tenantId: string): Promise<Tenant> {
    const tenantPromise = this.cache.get(tenantId);

    if (tenantPromise) {
      const { createdAt: currentTenantCreatedAt, wellKnownCache } = await tenantPromise;
      // `tenant-cache-expires-at` is a timestamp set in redis, which indicates all existing tenant instances
      // in LRU cache should be invalidated after this timestamp, effective for the entire server cluster.
      const tenantCacheExpiresAt = await wellKnownCache.get(
        'tenant-cache-expires-at',
        WellKnownCache.defaultKey
      );

      // If the current LRU cached tenant instance is created after the global expiration timestamp, return it
      if (!tenantCacheExpiresAt || tenantCacheExpiresAt < currentTenantCreatedAt) {
        return tenantPromise;
      }
      // Otherwise, create a new tenant instance and store in LRU cache, using the code below.
    }

    consoleLog.info('Init tenant:', tenantId);
    const newTenantPromise = Tenant.create(tenantId, redisCache);
    this.cache.set(tenantId, newTenantPromise);

    return newTenantPromise;
  }

  async endAll(): Promise<void> {
    await Promise.all(
      this.cache.dump().map(async ([, entry]) => {
        const tenant = await entry.value;

        return tenant.envSet.end();
      })
    );
  }
}

export const tenantPool = new TenantPool();

export * from './utils.js';
