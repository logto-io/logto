import { setTimeout } from 'node:timers/promises';

import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import { LRUCache } from 'lru-cache';

import { redisCache } from '#src/caches/index.js';
import { EnvSet } from '#src/env-set/index.js';

import Tenant from './Tenant.js';
import { TenantNotFoundError } from './utils.js';

const consoleLog = new ConsoleLog(chalk.magenta('tenant'));

/**
 * Safety cap on how many times {@link TenantPool.get} retries to converge on a healthy tenant
 * instance. Acquisition normally settles within one or two attempts; the cap only guards against
 * an unbounded loop under continuous cache invalidation.
 */
const maxTenantAcquireAttempts = 10;

/**
 * Safety cap on rebuilds after losing the request slot, applied per phase (the attempt-limit
 * fallback restarts its own count). Only slot losses consume it; health-check reloads spend
 * the shared {@link maxTenantAcquireAttempts} budget instead. The eviction disposal grace
 * makes losing a slot exceptional, so this is the backstop that bounds one acquisition to at
 * most 14 builds (a pure loss storm fails after 4) instead of recursing forever.
 */
const maxTenantRebuildAttempts = 3;

/**
 * How long an evicted tenant instance waits before disposal so requests already holding its
 * cached promise can reserve their slot first: pending claims are microtasks while this grace
 * elapses on a timer, so the claims always win. Without it the disposal continuation
 * deterministically beats the requester's, and an instance evicted before it is claimed is
 * always rebuilt. Each evicted instance keeps its idle pool open at most this much longer.
 */
const evictionDisposeGracePeriod = 1000;

/**
 * How long a {@link TenantNotFoundError} outcome is served from memory before the shared
 * `tenants` table is consulted again. Unknown-tenant probes are unauthenticated and would
 * otherwise cost a shared-pool query (plus an `Init tenant` log) per request; the answer is
 * deterministic (it changes only when the tenant is provisioned), so a short TTL caps that
 * load while keeping a newly provisioned tenant reachable promptly. A tenant whose id was
 * probed before its insert committed — possible when the id is user-chosen rather than
 * generated — can keep serving 404 for up to this long after creation.
 */
const tenantNotFoundCacheTtl = 60_000;

/**
 * Upper bound on tracked unknown-tenant ids. The key space is unauthenticated and
 * attacker-supplied, so this cap is what bounds memory under an id-spraying probe flood.
 */
const tenantNotFoundCacheSize = 1000;

class TenantPool {
  protected cache = new LRUCache<string, Promise<Tenant>>({
    max: EnvSet.values.tenantPoolSize,
    dispose: (entry, key, reason) => {
      // Eviction pressure is a leading incident indicator; keep it observable.
      consoleLog.info('Dispose cached tenant:', key, 'Reason:', reason);
      void (async () => {
        try {
          const tenant = await entry;

          // `undefined` is the timer's resolution value, present only to reach the options;
          // the `ref: false` timer cannot keep the process alive on shutdown.
          await setTimeout(evictionDisposeGracePeriod, undefined, { ref: false });

          try {
            if ((await tenant.dispose()) === 'timeout') {
              consoleLog.warn(
                'Tenant disposal drain timed out; pool closed with requests in flight:',
                key
              );
            }
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
   * Expiry timestamps for tenant ids that recently failed with {@link TenantNotFoundError},
   * keyed by tenant id rather than cache key since existence is domain-independent. Expiry is
   * checked manually against `Date.now()` — lru-cache's built-in `ttl` runs on
   * `performance.now()`, which the expiry test cannot drive.
   */
  protected notFoundCache = new LRUCache<string, number>({ max: tenantNotFoundCacheSize });

  /**
   * Resolve a tenant instance and atomically reserve a request slot on it (see
   * {@link Tenant.requestStart}). The caller owns the slot and must call
   * {@link Tenant.requestEnd} exactly once when the request finishes. Acquisition retries to
   * converge on a healthy instance, with a capped fallback to avoid looping forever. Tenant
   * ids that recently failed with {@link TenantNotFoundError} rethrow from a short-lived
   * negative cache without a new lookup.
   */
  async get(tenantId: string, customDomain?: string): Promise<Tenant> {
    const notFoundExpiresAt = this.notFoundCache.get(tenantId);

    if (notFoundExpiresAt !== undefined) {
      if (Date.now() < notFoundExpiresAt) {
        // The suffix keeps cache-served rejections distinguishable in logs and telemetry.
        throw new TenantNotFoundError(
          `Cannot find valid tenant credentials for ID ${tenantId} (negative cache)`
        );
      }

      this.notFoundCache.delete(tenantId);
    }

    const cacheKey = `${tenantId}-${customDomain ?? 'default'}`;

    return this.getWithAttempts(cacheKey, tenantId, customDomain, 0, 0);
  }

  async endAll(): Promise<void> {
    await Promise.all(
      this.cache.dump().map(async ([, entry]) => {
        const tenant = await entry.value;

        return tenant.dispose();
      })
    );
  }

  /**
   * @param attempt Acquisition attempts spent so far, incremented by reloads and slot losses.
   * @param lostSlots Request slots lost so far; {@link maxTenantRebuildAttempts} bounds the
   * rebuilds they trigger.
   */
  // eslint-disable-next-line max-params -- two separate retry budgets plus the cache identity
  private async getWithAttempts(
    cacheKey: string,
    tenantId: string,
    customDomain: string | undefined,
    attempt: number,
    lostSlots: number
  ): Promise<Tenant> {
    if (attempt >= maxTenantAcquireAttempts) {
      // The fallback counts its own slot losses from zero.
      return this.getAfterAttemptLimit(cacheKey, tenantId, customDomain, 0);
    }

    const { tenantPromise } = this.getOrCreateTenant(cacheKey, tenantId, customDomain);
    const tenant = await this.resolveCachedTenant(cacheKey, tenantId, tenantPromise);

    // Reserve a request slot *before* the async health check. If the instance has been
    // disposed concurrently, `requestStart()` returns `false` and we retry to acquire a
    // fresh one; otherwise the reserved slot keeps the database pool alive while this
    // request uses it, closing the dispose-before-request race.
    if (!tenant.requestStart()) {
      this.deleteCachedTenant(cacheKey, tenantPromise);
      consoleLog.warn(
        'Lost tenant request slot; instance was disposed before use:',
        tenantId,
        'Custom domain:',
        customDomain,
        'Attempt:',
        attempt,
        'Lost slots:',
        lostSlots + 1
      );

      if (lostSlots >= maxTenantRebuildAttempts) {
        throw new Error(
          `Failed to acquire a usable tenant instance: ${cacheKey} (lost slots: ${lostSlots + 1})`
        );
      }

      return this.getWithAttempts(cacheKey, tenantId, customDomain, attempt + 1, lostSlots + 1);
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

    // Reloads consume the shared acquire budget but not the rebuild budget.
    return this.getWithAttempts(cacheKey, tenantId, customDomain, attempt + 1, lostSlots);
  }

  /**
   * @param lostSlots Request slots lost in the fallback; {@link maxTenantRebuildAttempts}
   * bounds the rebuilds they trigger.
   */
  private async getAfterAttemptLimit(
    cacheKey: string,
    tenantId: string,
    customDomain: string | undefined,
    lostSlots: number
  ): Promise<Tenant> {
    // Attempt limit reached: reserve a slot on whatever is cached, dropping a disposed instance
    // with an identity check so a racing replacement is not removed accidentally.
    const { tenantPromise } = this.getOrCreateTenant(cacheKey, tenantId, customDomain);
    const tenant = await this.resolveCachedTenant(cacheKey, tenantId, tenantPromise);

    if (!tenant.requestStart()) {
      this.deleteCachedTenant(cacheKey, tenantPromise);
      consoleLog.warn(
        'Lost tenant request slot; instance was disposed before use:',
        tenantId,
        'Custom domain:',
        customDomain,
        'Fallback lost slots:',
        lostSlots + 1
      );

      if (lostSlots >= maxTenantRebuildAttempts) {
        throw new Error(
          `Failed to acquire a usable tenant instance: ${cacheKey} (lost slots: ${lostSlots + 1})`
        );
      }

      return this.getAfterAttemptLimit(cacheKey, tenantId, customDomain, lostSlots + 1);
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
    tenantId: string,
    tenantPromise: Promise<Tenant>
  ): Promise<Tenant> {
    try {
      return await tenantPromise;
    } catch (error: unknown) {
      if (this.cache.get(cacheKey) === tenantPromise) {
        this.cache.delete(cacheKey);
      }

      // Only the deterministic "tenant does not exist" outcome is negative-cached;
      // transient creation failures stay uncached so the next request retries.
      if (error instanceof TenantNotFoundError) {
        this.notFoundCache.set(tenantId, Date.now() + tenantNotFoundCacheTtl);
      }

      throw error;
    }
  }
}

export const tenantPool = new TenantPool();

export * from './utils.js';
