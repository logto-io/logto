import { LRUCache } from 'lru-cache';

const defaultWaitingRowCapTtlMs = 5000;
const defaultMaxCachedTenants = 10_000;
const defaultMaxCachedGroups = 50_000;

export type WaitingRowCapScope = 'group' | 'tenant';

export type WaitingRowReservation =
  | { allowed: true }
  | { allowed: false; scope: WaitingRowCapScope };

export type WaitingRowCapCheckInput = {
  tenantId: string;
  type: string;
  groupKey: string;
  maxWaitingRowsPerGroup: number;
  maxWaitingRowsPerTenant: number;
  countByGroup: (limit: number) => Promise<number>;
  countByType: (limit: number) => Promise<number>;
};

type WaitingRowCapCacheOptions = {
  ttlMs?: number;
  maxTenants?: number;
  maxGroups?: number;
  now?: () => number;
};

type CacheEntry = {
  count: number;
  expiresAt: number;
};

/**
 * Short-TTL bounded LRU cache of waiting-row counts per tenant and per group (`hookId` for
 * webhooks). Local enqueues increment cached counts without extending the TTL so high-throughput
 * tenants below the cap avoid repeated bounded `jobs` count queries while periodic refreshes
 * observe rows drained by the worker.
 */
export class WaitingRowCapCache {
  readonly #ttlMs: number;
  readonly #now: () => number;
  readonly #tenantCounts: LRUCache<string, CacheEntry>;
  readonly #groupCounts: LRUCache<string, CacheEntry>;
  readonly #inFlightTenantLoads = new Map<string, Promise<CacheEntry>>();
  readonly #inFlightGroupLoads = new Map<string, Promise<CacheEntry>>();

  constructor(options?: WaitingRowCapCacheOptions) {
    this.#ttlMs = options?.ttlMs ?? defaultWaitingRowCapTtlMs;
    this.#now = options?.now ?? (() => Date.now());
    this.#tenantCounts = new LRUCache<string, CacheEntry>({
      max: options?.maxTenants ?? defaultMaxCachedTenants,
    });
    this.#groupCounts = new LRUCache<string, CacheEntry>({
      max: options?.maxGroups ?? defaultMaxCachedGroups,
    });
  }

  /**
   * Check per-group and per-tenant waiting-row caps and reserve one slot in the local cache if
   * both are below their limits.
   */
  async tryReserve({
    tenantId,
    type,
    groupKey,
    maxWaitingRowsPerGroup,
    maxWaitingRowsPerTenant,
    countByGroup,
    countByType,
  }: WaitingRowCapCheckInput): Promise<WaitingRowReservation> {
    const tenantCacheKey = JSON.stringify([tenantId, type]);
    const groupCacheKey = JSON.stringify([tenantId, type, groupKey]);

    // Fast path: reject immediately when the tenant is already cached at or above its cap.
    const cachedTenant = this.getFresh(this.#tenantCounts, tenantCacheKey);
    if (cachedTenant && cachedTenant.count >= maxWaitingRowsPerTenant) {
      return { allowed: false, scope: 'tenant' };
    }

    const groupEntry = await this.loadCount({
      cache: this.#groupCounts,
      inFlight: this.#inFlightGroupLoads,
      key: groupCacheKey,
      limit: maxWaitingRowsPerGroup,
      query: countByGroup,
    });

    if (groupEntry.count >= maxWaitingRowsPerGroup) {
      return { allowed: false, scope: 'group' };
    }

    const tenantEntry = await this.loadCount({
      cache: this.#tenantCounts,
      inFlight: this.#inFlightTenantLoads,
      key: tenantCacheKey,
      limit: maxWaitingRowsPerTenant,
      query: countByType,
    });

    return this.commitReservation({
      tenantCacheKey,
      groupCacheKey,
      fallbackGroupEntry: groupEntry,
      fallbackTenantEntry: tenantEntry,
      maxWaitingRowsPerGroup,
      maxWaitingRowsPerTenant,
    });
  }

  private commitReservation({
    tenantCacheKey,
    groupCacheKey,
    fallbackGroupEntry,
    fallbackTenantEntry,
    maxWaitingRowsPerGroup,
    maxWaitingRowsPerTenant,
  }: {
    tenantCacheKey: string;
    groupCacheKey: string;
    fallbackGroupEntry: CacheEntry;
    fallbackTenantEntry: CacheEntry;
    maxWaitingRowsPerGroup: number;
    maxWaitingRowsPerTenant: number;
  }): WaitingRowReservation {
    // Re-read synchronously after all awaits so reservations that share a cache entry see each
    // other's increments.
    const currentGroup = this.getFresh(this.#groupCounts, groupCacheKey) ?? fallbackGroupEntry;
    if (currentGroup.count >= maxWaitingRowsPerGroup) {
      return { allowed: false, scope: 'group' };
    }

    const currentTenant = this.getFresh(this.#tenantCounts, tenantCacheKey) ?? fallbackTenantEntry;
    if (currentTenant.count >= maxWaitingRowsPerTenant) {
      return { allowed: false, scope: 'tenant' };
    }

    const now = this.#now();
    const nextGroupEntry: CacheEntry = {
      count: currentGroup.count + 1,
      expiresAt: currentGroup.expiresAt,
    };
    const nextTenantEntry: CacheEntry = {
      count: currentTenant.count + 1,
      expiresAt: currentTenant.expiresAt,
    };

    if (nextGroupEntry.expiresAt > now) {
      this.#groupCounts.set(groupCacheKey, nextGroupEntry);
    }

    if (nextTenantEntry.expiresAt > now) {
      this.#tenantCounts.set(tenantCacheKey, nextTenantEntry);
    }

    return { allowed: true };
  }

  private getFresh(cache: LRUCache<string, CacheEntry>, key: string): CacheEntry | undefined {
    const entry = cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= this.#now()) {
      cache.delete(key);
      return undefined;
    }

    return entry;
  }

  private async loadCount({
    cache,
    inFlight,
    key,
    limit,
    query,
  }: {
    cache: LRUCache<string, CacheEntry>;
    inFlight: Map<string, Promise<CacheEntry>>;
    key: string;
    limit: number;
    query: (limit: number) => Promise<number>;
  }): Promise<CacheEntry> {
    const cached = this.getFresh(cache, key);
    if (cached) {
      return cached;
    }

    const existing = inFlight.get(key);
    if (existing) {
      return existing;
    }

    const loadPromise = (async () => {
      try {
        const fetchedAt = this.#now();
        const count = await query(limit);
        const entry: CacheEntry = { count, expiresAt: fetchedAt + this.#ttlMs };

        if (entry.expiresAt > this.#now()) {
          cache.set(key, entry);
        }

        return entry;
      } finally {
        inFlight.delete(key);
      }
    })();

    inFlight.set(key, loadPromise);
    return loadPromise;
  }
}
