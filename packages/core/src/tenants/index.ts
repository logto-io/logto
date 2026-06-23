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
    dispose: (entry) => {
      void (async () => {
        try {
          const tenant = await entry;

          try {
            await tenant.dispose();
          } catch (error: unknown) {
            consoleLog.warn('Failed to dispose tenant:', error);
          }
        } catch {
          // Rejected tenant creation promises are evicted so future requests can retry.
        }
      })();
    },
  });

  /**
   * Resolve a tenant instance and atomically reserve a request slot on it (see
   * {@link Tenant.requestStart}). The caller owns the slot and must call
   * {@link Tenant.requestEnd} exactly once when the request finishes. Acquisition retries to
   * converge on a healthy instance, with a capped fallback to avoid looping forever.
   */
  async get(tenantId: string, customDomain?: string): Promise<Tenant> {
    const cacheKey = `${tenantId}-${customDomain ?? 'default'}`;

    return this.getWithAttempts(cacheKey, tenantId, customDomain, 0);
  }

  async endAll(): Promise<void> {
    await Promise.all(
      this.cache.dump().map(async ([, entry]) => {
        const tenant = await entry.value;

        return tenant.dispose();
      })
    );
  }

  private async getWithAttempts(
    cacheKey: string,
    tenantId: string,
    customDomain: string | undefined,
    attempt: number
  ): Promise<Tenant> {
    if (attempt >= maxTenantAcquireAttempts) {
      return this.getAfterAttemptLimit(cacheKey, tenantId, customDomain);
    }

    const { tenantPromise } = this.getOrCreateTenant(cacheKey, tenantId, customDomain);
    const tenant = await this.resolveCachedTenant(cacheKey, tenantPromise);

    // Reserve a request slot *before* the async health check. If the instance has been
    // disposed concurrently, `requestStart()` returns `false` and we retry to acquire a
    // fresh one; otherwise the reserved slot keeps the database pool alive while this
    // request uses it, closing the dispose-before-request race.
    if (!tenant.requestStart()) {
      this.deleteCachedTenant(cacheKey, tenantPromise);

      return this.getWithAttempts(cacheKey, tenantId, customDomain, attempt + 1);
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
      this.createAndCacheTenant(cacheKey, tenantId, customDomain, 'Reload');
    }

    return this.getWithAttempts(cacheKey, tenantId, customDomain, attempt + 1);
  }

  private async getAfterAttemptLimit(
    cacheKey: string,
    tenantId: string,
    customDomain: string | undefined
  ): Promise<Tenant> {
    // Attempt limit reached: reserve a slot on whatever is cached, dropping a disposed instance
    // with an identity check so a racing replacement is not removed accidentally.
    const { tenantPromise } = this.getOrCreateTenant(cacheKey, tenantId, customDomain);
    const tenant = await this.resolveCachedTenant(cacheKey, tenantPromise);

    if (!tenant.requestStart()) {
      this.deleteCachedTenant(cacheKey, tenantPromise);

      return this.getAfterAttemptLimit(cacheKey, tenantId, customDomain);
    }

    consoleLog.warn(
      'Tenant acquire retry limit reached; serving cached tenant without a health check:',
      tenantId,
      'Custom domain:',
      customDomain
    );

    return tenant;
  }

  private getOrCreateTenant(
    cacheKey: string,
    tenantId: string,
    customDomain?: string
  ): { tenantPromise: Promise<Tenant> } {
    const tenantPromise = this.cache.get(cacheKey);

    if (tenantPromise) {
      return { tenantPromise };
    }

    return this.createAndCacheTenant(cacheKey, tenantId, customDomain, 'Init');
  }

  private deleteCachedTenant(cacheKey: string, tenantPromise: Promise<Tenant>) {
    if (this.cache.get(cacheKey) === tenantPromise) {
      this.cache.delete(cacheKey);
    }
  }

  private createAndCacheTenant(
    cacheKey: string,
    tenantId: string,
    customDomain: string | undefined,
    action: 'Init' | 'Reload'
  ): { tenantPromise: Promise<Tenant> } {
    consoleLog.info(`${action} tenant:`, tenantId, 'Custom domain:', customDomain);
    const newTenantPromise = Tenant.create({ id: tenantId, redisCache, customDomain });
    this.cache.set(cacheKey, newTenantPromise);

    return { tenantPromise: newTenantPromise };
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
