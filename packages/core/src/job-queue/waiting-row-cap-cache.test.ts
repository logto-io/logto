import { WaitingRowCapCache } from './waiting-row-cap-cache.js';

const { jest } = import.meta;

describe('WaitingRowCapCache', () => {
  it('queries bounded counts once within TTL and increments locally until hitting group cap', async () => {
    const now = jest.fn(() => 1000);
    const cache = new WaitingRowCapCache({ ttlMs: 5000, now });
    const countByGroup = jest.fn(async () => 1);
    const countByType = jest.fn(async () => 2);

    const first = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'hook-1',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 10,
      countByGroup,
      countByType,
    });
    expect(first.allowed).toBe(true);
    expect(countByGroup).toHaveBeenCalledWith(3);
    expect(countByType).toHaveBeenCalledWith(10);

    // Second enqueue within TTL uses local incremented count (group: 2, tenant: 3).
    now.mockReturnValue(2000);
    const second = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'hook-1',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 10,
      countByGroup,
      countByType,
    });
    expect(second.allowed).toBe(true);
    expect(countByGroup).toHaveBeenCalledTimes(1);
    expect(countByType).toHaveBeenCalledTimes(1);

    // Third enqueue within TTL sees cached group count = 3 >= 3 and drops without querying DB.
    now.mockReturnValue(3000);
    const third = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'hook-1',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 10,
      countByGroup,
      countByType,
    });
    expect(third).toEqual({ allowed: false, scope: 'group' });
    expect(countByGroup).toHaveBeenCalledTimes(1);
    expect(countByType).toHaveBeenCalledTimes(1);
  });

  it('does not extend TTL on local increments and refreshes counts after expiry', async () => {
    const now = jest.fn(() => 1000);
    const cache = new WaitingRowCapCache({ ttlMs: 5000, now });
    const countByGroup = jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(0);
    const countByType = jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(0);

    const first = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'hook-1',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 10,
      countByGroup,
      countByType,
    });
    expect(first.allowed).toBe(true);

    // Advance close to TTL (still < 6000) — local increment does NOT push expiresAt past 6000.
    now.mockReturnValue(5500);
    const blocked = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'hook-1',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 10,
      countByGroup,
      countByType,
    });
    expect(blocked).toEqual({ allowed: false, scope: 'group' });

    // Once initial 5s TTL expires at 6000, the next check re-queries DB and sees drained rows.
    now.mockReturnValue(6000);
    const refreshed = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'hook-1',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 10,
      countByGroup,
      countByType,
    });
    expect(refreshed.allowed).toBe(true);
    expect(countByGroup).toHaveBeenCalledTimes(2);
    expect(countByType).toHaveBeenCalledTimes(2);
  });

  it('enforces per-tenant cap across hooks and short-circuits unseen hooks via tenant fast path', async () => {
    const now = jest.fn(() => 1000);
    const cache = new WaitingRowCapCache({ ttlMs: 5000, now });
    const countByGroup = jest.fn(async () => 0);
    const countByType = jest.fn(async () => 2);

    const hook1 = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'hook-1',
      maxWaitingRowsPerGroup: 5,
      maxWaitingRowsPerTenant: 3,
      countByGroup,
      countByType,
    });
    expect(hook1.allowed).toBe(true);
    expect(countByGroup).toHaveBeenCalledTimes(1);
    expect(countByType).toHaveBeenCalledTimes(1);

    // Unseen hook-2 is immediately rejected by cached tenant count = 3 without querying countByGroup.
    const hook2 = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'hook-2',
      maxWaitingRowsPerGroup: 5,
      maxWaitingRowsPerTenant: 3,
      countByGroup,
      countByType,
    });
    expect(hook2).toEqual({ allowed: false, scope: 'tenant' });
    expect(countByGroup).toHaveBeenCalledTimes(1);
    expect(countByType).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent cold-cache loads and enforces exact caps across concurrent reservations', async () => {
    const cache = new WaitingRowCapCache({ ttlMs: 5000, now: () => 1000 });
    const countByGroup = jest.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      return 1;
    });
    const countByType = jest.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      return 1;
    });

    const results = await Promise.all(
      Array.from({ length: 5 }, async () =>
        cache.tryReserve({
          tenantId: 'tenant-1',
          type: 'webhook',
          groupKey: 'hook-1',
          maxWaitingRowsPerGroup: 3,
          maxWaitingRowsPerTenant: 10,
          countByGroup,
          countByType,
        })
      )
    );

    expect(countByGroup).toHaveBeenCalledTimes(1);
    expect(countByType).toHaveBeenCalledTimes(1);
    expect(results.filter((result) => result.allowed)).toHaveLength(2);
    expect(results.filter((result) => !result.allowed)).toEqual([
      { allowed: false, scope: 'group' },
      { allowed: false, scope: 'group' },
      { allowed: false, scope: 'group' },
    ]);
  });

  it('isolates cached counts across tenants and respects LRU capacity bounds', async () => {
    const cache = new WaitingRowCapCache({
      ttlMs: 5000,
      maxTenants: 1,
      maxGroups: 1,
      now: () => 1000,
    });
    const countByGroup = jest.fn(async () => 2);
    const countByType = jest.fn(async () => 2);

    const tenant1 = await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'shared-hook',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 3,
      countByGroup,
      countByType,
    });
    expect(tenant1.allowed).toBe(true);

    // Tenant 2 with the same groupKey gets its own cache entry and evicts tenant-1 due to max=1.
    const tenant2 = await cache.tryReserve({
      tenantId: 'tenant-2',
      type: 'webhook',
      groupKey: 'shared-hook',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 3,
      countByGroup,
      countByType,
    });
    expect(tenant2.allowed).toBe(true);
    expect(countByGroup).toHaveBeenCalledTimes(2);
    expect(countByType).toHaveBeenCalledTimes(2);

    // Tenant 1 was evicted, so its next call re-queries DB.
    await cache.tryReserve({
      tenantId: 'tenant-1',
      type: 'webhook',
      groupKey: 'shared-hook',
      maxWaitingRowsPerGroup: 3,
      maxWaitingRowsPerTenant: 3,
      countByGroup,
      countByType,
    });
    expect(countByGroup).toHaveBeenCalledTimes(3);
    expect(countByType).toHaveBeenCalledTimes(3);
  });
});
