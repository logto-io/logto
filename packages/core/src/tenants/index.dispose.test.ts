import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const tenantCreate = jest.fn();
const graceResolvers: Array<() => void> = [];
const graceDelay = jest.fn(
  async () =>
    new Promise<void>((resolve) => {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- capture resolvers to release the grace deterministically
      graceResolvers.push(resolve);
    })
);

mockEsm('node:timers/promises', () => ({ setTimeout: graceDelay }));

mockEsm('#src/caches/index.js', () => ({
  redisCache: {},
}));

mockEsm('#src/env-set/index.js', () => ({
  // Size 1 so a single extra `get` triggers an LRU eviction.
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

describe('TenantPool eviction disposal grace', () => {
  it('defers disposal until the grace elapses without delaying acquisition', async () => {
    const evicted = createMockTenant();
    const replacement = createMockTenant();
    tenantCreate.mockResolvedValueOnce(evicted).mockResolvedValue(replacement);

    await expect(tenantPool.get('tenant-grace-disposal')).resolves.toBe(evicted);
    // Acquiring the replacement evicts the first entry, yet resolves while that entry's grace
    // is still pending: the grace never sits on the acquisition path.
    await expect(tenantPool.get('tenant-grace-neighbor')).resolves.toBe(replacement);

    expect(graceDelay).toHaveBeenCalledWith(expect.any(Number), undefined, { ref: false });
    expect(evicted.dispose).not.toHaveBeenCalled();

    for (const resolve of graceResolvers) {
      resolve();
    }
    // Yield a macrotask so the released disposal continuation runs.
    await new Promise((resolve) => {
      setImmediate(resolve);
    });

    expect(evicted.dispose).toHaveBeenCalledTimes(1);
    expect(replacement.dispose).not.toHaveBeenCalled();
  });
});
