import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import { LRUCache } from 'lru-cache';

import { redisCache } from '#src/caches/index.js';
import { EnvSet } from '#src/env-set/index.js';

import Tenant from './Tenant.js';

const consoleLog = new ConsoleLog(chalk.magenta('tenant'));

/**
 * Safety cap on how many times {@link TenantPool.get} retries to converge on a healthy tenant
 * instance. Acquisition normally settles within one or two attempts; the cap only guards against
 * an unbounded loop under continuous cache invalidation.
 */
const maxTenantAcquireAttempts = 10;

class TenantPool {
  protected cache = new LRUCache<string, Promise<Tenant>>({
    max: EnvSet.values.tenantPoolSize,
    dispose: async (entry) => {
      const tenant = await entry;
      void tenant.dispose();
    },
  });

  /**
   * Resolve a tenant instance and atomically reserve a request slot on it (see
   * {@link Tenant.requestStart}). The caller owns the slot and must call
   * {@link Tenant.requestEnd} exactly once when the request finishes. Acquisition retries to
   * converge on a healthy instance, with a capped fallback to avoid looping forever.
   */
  async get(tenantId: string, customDomain?: string, attempt = 0): Promise<Tenant> {
    const cacheKey = `${tenantId}-${customDomain ?? 'default'}`;
    const tenantPromise = this.cache.get(cacheKey);

    if (tenantPromise && attempt < maxTenantAcquireAttempts) {
      const tenant = await this.resolveCachedTenant(cacheKey, tenantPromise);

      // Reserve a request slot *before* the async health check. If the instance has been
      // disposed concurrently, `requestStart()` returns `false` and we retry to acquire a
      // fresh one; otherwise the reserved slot keeps the database pool alive while this
      // request uses it, closing the dispose-before-request race.
      if (!tenant.requestStart()) {
        return this.get(tenantId, customDomain, attempt + 1);
      }

      // If the current LRU cached tenant instance is still healthy, return it (slot held).
      // Release the reserved slot if the health check itself fails before the request owns it.
      try {
        if (await tenant.checkHealth()) {
          return tenant;
        }
      } catch (error: unknown) {
        tenant.requestEnd();
        throw error;
      }

      // Otherwise the instance is stale: release our slot and recreate it. Deduplicate
      // concurrent recreations so racing requests don't dispose each other's freshly created
      // instances — only the caller that still sees this exact stale promise replaces it,
      // others retry and pick up the new instance.
      tenant.requestEnd();

      if (this.cache.get(cacheKey) === tenantPromise) {
        consoleLog.info('Reload tenant:', tenantId, 'Custom domain:', customDomain);
        this.cache.set(cacheKey, Tenant.create({ id: tenantId, redisCache, customDomain }));
      }

      return this.get(tenantId, customDomain, attempt + 1);
    }

    if (!tenantPromise) {
      consoleLog.info('Init tenant:', tenantId, 'Custom domain:', customDomain);
      this.cache.set(cacheKey, Tenant.create({ id: tenantId, redisCache, customDomain }));

      return this.get(tenantId, customDomain, attempt + 1);
    }

    // Attempt limit reached: reserve a slot on whatever is cached, dropping a disposed instance.
    const tenant = await this.resolveCachedTenant(cacheKey, tenantPromise);

    if (!tenant.requestStart()) {
      this.cache.delete(cacheKey);

      return this.get(tenantId, customDomain, attempt + 1);
    }

    return tenant;
  }

  async endAll(): Promise<void> {
    await Promise.all(
      this.cache.dump().map(async ([, entry]) => {
        const tenant = await entry.value;

        return tenant.envSet.end();
      })
    );
  }

  private async resolveCachedTenant(
    cacheKey: string,
    tenantPromise: Promise<Tenant>
  ): Promise<Tenant> {
    try {
      return await tenantPromise;
    } catch (error: unknown) {
      if (this.cache.get(cacheKey) === tenantPromise) {
        this.cache.delete(cacheKey);
      }

      throw error;
    }
  }
}

export const tenantPool = new TenantPool();

export * from './utils.js';
