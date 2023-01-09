import LRUCache from 'lru-cache';

import Tenant from './Tenant.js';

class TenantPool {
  protected cache = new LRUCache<string, Tenant>({ max: 500 });

  get(tenantId: string): Tenant {
    const tenant = this.cache.get(tenantId);

    if (tenant) {
      return tenant;
    }

    const newTenant = new Tenant(tenantId);
    this.cache.set(tenantId, newTenant);

    return newTenant;
  }
}

export const tenantPool = new TenantPool();

export * from './consts.js';
