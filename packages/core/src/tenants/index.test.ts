import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const tenantCreate = jest.fn();

mockEsm('#src/caches/index.js', () => ({
  redisCache: {},
}));

mockEsm('#src/env-set/index.js', () => ({
  // Size 1 so a single extra `get` triggers an LRU eviction (see the eviction race test).
  EnvSet: { values: { tenantPoolSize: 1 } },
}));

mockEsm('./Tenant.js', () => ({
  default: { create: tenantCreate },
}));

const { tenantPool } = await import('./index.js');

const createMockTenant = () => ({
  requestStart: jest.fn<boolean, never[]>(() => true),
  requestEnd: jest.fn(),
  checkHealth: jest.fn(async () => true),
  dispose: jest.fn(async () => true),
});

// The pool is a module-level singleton, so each test uses a distinct tenant id.
describe('TenantPool.get', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reserves a slot and returns the instance', async () => {
    const tenant = createMockTenant();
    tenantCreate.mockResolvedValue(tenant);

    await expect(tenantPool.get('tenant-happy-path')).resolves.toBe(tenant);

    expect(tenantCreate).toHaveBeenCalledTimes(1);
    expect(tenant.requestStart).toHaveBeenCalledTimes(1);
    expect(tenant.requestEnd).not.toHaveBeenCalled();
  });

  it('rebuilds once when the request slot is lost', async () => {
    const disposed = createMockTenant();
    disposed.requestStart.mockReturnValue(false);
    const healthy = createMockTenant();

    tenantCreate.mockResolvedValueOnce(disposed).mockResolvedValue(healthy);

    await expect(tenantPool.get('tenant-lost-slot')).resolves.toBe(healthy);

    expect(tenantCreate).toHaveBeenCalledTimes(2);
  });

  it('gives up when the slot is lost on every attempt', async () => {
    tenantCreate.mockImplementation(async () => {
      const tenant = createMockTenant();
      tenant.requestStart.mockReturnValue(false);

      return tenant;
    });

    // The full message pins the cache-key identity and the loss count.
    await expect(tenantPool.get('tenant-budget-exhausted')).rejects.toThrow(
      'Failed to acquire a usable tenant instance: tenant-budget-exhausted-default (lost slots: 4)'
    );

    // The initial build plus `maxTenantRebuildAttempts` rebuilds, and no more.
    expect(tenantCreate).toHaveBeenCalledTimes(4);
  });

  it('terminates when the fallback keeps losing the slot', async () => {
    tenantCreate.mockImplementation(async () => {
      const tenant = createMockTenant();

      // Reloads drive acquisition to the fallback, which then keeps losing the slot.
      if (tenantCreate.mock.calls.length > 10) {
        tenant.requestStart.mockReturnValue(false);
      } else {
        tenant.checkHealth.mockResolvedValue(false);
      }

      return tenant;
    });

    await expect(tenantPool.get('tenant-fallback-lost-slot')).rejects.toThrow(
      /Failed to acquire a usable tenant instance/
    );

    // The initial build, 10 health-check reloads, then 3 bounded rebuilds in the fallback.
    expect(tenantCreate).toHaveBeenCalledTimes(14);
  });

  it('recovers in the fallback when a lost slot settles on the next build', async () => {
    const createdTenants: Array<ReturnType<typeof createMockTenant>> = [];
    tenantCreate.mockImplementation(async () => {
      const tenant = createMockTenant();
      const call = tenantCreate.mock.calls.length;
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- collect test doubles to assert the served instance
      createdTenants.push(tenant);

      // Reloads exhaust the acquire budget, the fallback loses its first slot, then recovers.
      if (call === 11) {
        tenant.requestStart.mockReturnValue(false);
      } else if (call <= 10) {
        tenant.checkHealth.mockResolvedValue(false);
      }

      return tenant;
    });

    const served = await tenantPool.get('tenant-fallback-recovery');

    // The initial build, 10 health-check reloads, then one rebuild after the lost slot.
    expect(tenantCreate).toHaveBeenCalledTimes(12);
    expect(served).toBe(createdTenants.at(-1));
    // The fallback serves without consulting the health check.
    expect(served.checkHealth).not.toHaveBeenCalled();
  });

  it('grants the fallback a fresh rebuild budget', async () => {
    tenantCreate.mockImplementation(async () => {
      const tenant = createMockTenant();
      const call = tenantCreate.mock.calls.length;

      // Two early losses, then reloads until the acquire budget runs out, then losses again:
      // the fallback must not inherit the main path's spent losses.
      if (call <= 2 || call >= 11) {
        tenant.requestStart.mockReturnValue(false);
      } else {
        tenant.checkHealth.mockResolvedValue(false);
      }

      return tenant;
    });

    await expect(tenantPool.get('tenant-fallback-budget')).rejects.toThrow(
      /Failed to acquire a usable tenant instance/
    );

    // Two lost builds, a fresh build plus 8 reloads, then 3 fallback rebuilds: the fallback
    // restarted the loss budget at zero.
    expect(tenantCreate).toHaveBeenCalledTimes(14);
  });

  it('keeps the rebuild budget when reloads precede a lost slot', async () => {
    tenantCreate.mockImplementation(async () => {
      const tenant = createMockTenant();
      const call = tenantCreate.mock.calls.length;

      // Three stale instances, then one lost slot, then a healthy instance: reloads must not
      // consume the rebuild budget, so the lost slot still gets its retry.
      if (call <= 3) {
        tenant.checkHealth.mockResolvedValue(false);
      } else if (call === 4) {
        tenant.requestStart.mockReturnValue(false);
      }

      return tenant;
    });

    await expect(tenantPool.get('tenant-reloads-then-loss')).resolves.toBeTruthy();

    expect(tenantCreate).toHaveBeenCalledTimes(5);
  });

  it('releases the reserved slot when the health check throws', async () => {
    const tenant = createMockTenant();
    tenant.checkHealth.mockRejectedValue(new Error('health check failed'));
    tenantCreate.mockResolvedValue(tenant);

    await expect(tenantPool.get('tenant-health-throw')).rejects.toThrow('health check failed');

    expect(tenant.requestStart).toHaveBeenCalledTimes(1);
    expect(tenant.requestEnd).toHaveBeenCalledTimes(1);
  });

  it('recovers after a rejected creation is evicted', async () => {
    const healthy = createMockTenant();
    tenantCreate.mockRejectedValueOnce(new Error('bootstrap failed')).mockResolvedValue(healthy);

    await expect(tenantPool.get('tenant-create-rejected')).rejects.toThrow('bootstrap failed');
    await expect(tenantPool.get('tenant-create-rejected')).resolves.toBe(healthy);

    expect(tenantCreate).toHaveBeenCalledTimes(2);
  });

  it('keeps an evicted instance claimable until its requester takes the slot', async () => {
    const evicted = createMockTenant();
    // Mirror the real instance: once disposed, new request slots are refused.
    evicted.dispose.mockImplementation(async () => {
      evicted.requestStart.mockReturnValue(false);

      return true;
    });
    const neighbor = createMockTenant();
    tenantCreate.mockResolvedValueOnce(evicted).mockResolvedValue(neighbor);

    // Push the entry out of the size-1 LRU while the first request is still between its cache
    // read and its claim. Without the disposal grace period, the eviction hook disposes the
    // instance first and the tenant is rebuilt.
    const promise = tenantPool.get('tenant-evicted-before-claim');
    const neighborPromise = tenantPool.get('tenant-eviction-neighbor');

    await expect(promise).resolves.toBe(evicted);
    await expect(neighborPromise).resolves.toBe(neighbor);

    // The evicted instance is claimed, not rebuilt.
    expect(tenantCreate).toHaveBeenCalledTimes(2);
    expect(evicted.requestStart).toHaveBeenCalledTimes(1);
  });

  it('serves a cached instance when reloads never settle', async () => {
    const createdTenants: Array<ReturnType<typeof createMockTenant>> = [];
    tenantCreate.mockImplementation(async () => {
      const tenant = createMockTenant();
      tenant.checkHealth.mockResolvedValue(false);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- collect test doubles to assert slot release
      createdTenants.push(tenant);

      return tenant;
    });

    // An unhealthy instance reloads rather than losing its slot, so acquisition reaches the
    // fallback and serves without a health check instead of throwing.
    const served = await tenantPool.get('tenant-reload');

    expect(tenantCreate).toHaveBeenCalledTimes(11);
    expect(served).toBe(createdTenants.at(-1));

    // Every stale instance released its probe slot; the served one keeps its slot for the caller.
    for (const tenant of createdTenants.slice(0, -1)) {
      expect(tenant.requestEnd).toHaveBeenCalledTimes(1);
    }
    expect(served.requestEnd).not.toHaveBeenCalled();
  });
});
