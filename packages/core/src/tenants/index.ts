import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import { LRUCache } from 'lru-cache';

import { redisCache } from '#src/caches/index.js';
import { EnvSet } from '#src/env-set/index.js';

import Tenant from './Tenant.js';

const consoleLog = new ConsoleLog(chalk.magenta('tenant'));

class TenantPool {
  protected cache = new LRUCache<string, Promise<Tenant>>({
    max: EnvSet.values.tenantPoolSize,
    dispose: async (entry) => {
      const tenant = await entry;
      void tenant.dispose();
    },
  });

  async get(tenantId: string, customDomain?: string): Promise<Tenant> {
    const cacheKey = `${tenantId}-${customDomain ?? 'default'}`;
    const tenantPromise = this.cache.get(cacheKey);

    if (tenantPromise) {
      const tenant = await tenantPromise;
      // If the current LRU cached tenant instance is still healthy, return it
      if (await tenant.checkHealth()) {
        return tenantPromise;
      }
      // Otherwise, create a new tenant instance and store in LRU cache, using the code below.
    }

    consoleLog.info('Init tenant:', tenantId, customDomain);
    const newTenantPromise = Tenant.create({ id: tenantId, redisCache, customDomain });
    this.cache.set(cacheKey, newTenantPromise);

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
