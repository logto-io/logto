import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsm, mockEsmDefault } = createMockUtils(jest);

mockEsm('#src/caches/index.js', () => ({
  redisCache: {},
}));

mockEsm('#src/env-set/index.js', () => ({
  EnvSet: {
    values: {
      tenantPoolSize: 100,
    },
  },
}));

const tenantCreate = jest.fn();

mockEsmDefault('./Tenant.js', () => ({
  create: tenantCreate,
}));

const { TenantPool } = await import('./index.js');

describe('TenantPool', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reuses the same refresh promise for concurrent stale-tenant requests', async () => {
    const staleTenant = {
      checkHealth: jest.fn(async () => {
        await new Promise((resolve) => {
          setImmediate(resolve);
        });

        return false;
      }),
      dispose: jest.fn(),
      envSet: { end: jest.fn() },
    };
    const freshTenant = {
      checkHealth: jest.fn(async () => true),
      dispose: jest.fn(),
      envSet: { end: jest.fn() },
    };
    tenantCreate.mockImplementation(
      async () =>
        new Promise<typeof freshTenant>((resolve) => {
          setImmediate(() => {
            resolve(freshTenant);
          });
        })
    );

    class TestTenantPool extends TenantPool {
      seed(cacheKey: string, tenant: typeof staleTenant) {
        this.cache.set(cacheKey, Promise.resolve(tenant as never));
      }
    }

    const pool = new TestTenantPool();
    pool.seed('foo-default', staleTenant);

    const firstGet = pool.get('foo');
    const secondGet = pool.get('foo');

    await expect(firstGet).resolves.toBe(freshTenant);
    await expect(secondGet).resolves.toBe(freshTenant);
    expect(tenantCreate).toHaveBeenCalledTimes(1);
  });
});
