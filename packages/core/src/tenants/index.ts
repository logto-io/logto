import LRUCache from 'lru-cache';

import { EnvSet } from '#src/env-set/index.js';

import Tenant from './Tenant.js';

export class TenantPool {
  protected cache = new LRUCache<string, Promise<Tenant>>({
    max: EnvSet.values.tenantPoolSize,
    dispose: (tenant) => {
      const tenant = await entry;
      void tenant.dispose();
    },
  });

  async get(tenantId: string): Promise<Tenant> {
    const tenant = this.cache.get(tenantId);

    if (tenant) {
      return tenant;
    }

    console.log('Init tenant:', tenantId);
    const newTenant = Tenant.create(tenantId);
    this.cache.set(tenantId, newTenant);

    return newTenant;
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
