import LRUCache from 'lru-cache';

import type SharedTenantContext from './SharedTenantContext.js';
import Tenant from './Tenant.js';

export class TenantPool {
  protected cache = new LRUCache<string, Tenant>({ max: 500 });

  async get(tenantId: string, sharedContext: SharedTenantContext): Promise<Tenant> {
    const tenant = this.cache.get(tenantId);

    if (tenant) {
      return tenant;
    }

    console.log('Init tenant:', tenantId);
    const newTenant = await Tenant.create(tenantId, sharedContext);
    this.cache.set(tenantId, newTenant);

    return newTenant;
  }

  async endAll(): Promise<void> {
    await Promise.all(
      this.cache.dump().flatMap(([, tenant]) => {
        const { poolSafe, queryClientSafe } = tenant.value.envSet;

        return [poolSafe?.end(), queryClientSafe?.end()];
      })
    );
  }
}

export const tenantPool = new TenantPool();

export * from './utils.js';
