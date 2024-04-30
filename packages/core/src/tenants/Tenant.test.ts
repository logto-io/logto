import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import Sinon from 'sinon';

import { RedisCache } from '#src/caches/index.js';
import { WellKnownCache } from '#src/caches/well-known.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { emptyMiddleware } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm, mockEsmDefault } = createMockUtils(jest);

const buildMockMiddleware = (name: string) => {
  const mock = jest.fn(() => emptyMiddleware);
  mockEsm(`#src/middleware/koa-${name}.js`, () => ({
    default: mock,
    ...(name === 'audit-log' && { LogEntry: jest.fn() }),
  }));

  return mock;
};

const middlewareList = Object.freeze(
  [
    'error-handler',
    'i18next',
    'audit-log',
    'oidc-error-handler',
    'slonik-error-handler',
    'spa-proxy',
    'console-redirect-proxy',
  ].map((name) => [name, buildMockMiddleware(name)] as const)
);

const userMiddlewareList = middlewareList.map(
  ([name, middleware]) => [name, middleware, name !== 'console-redirect-proxy'] as const
);
const adminMiddlewareList = middlewareList.map(
  ([name, middleware]) => [name, middleware, name !== 'check-demo-app'] as const
);

mockEsm('./utils.js', () => ({
  getTenantDatabaseDsn: async () => 'postgres://mock.db.url',
}));

// eslint-disable-next-line unicorn/consistent-function-scoping
mockEsmDefault('#src/oidc/init.js', () => () => createMockProvider());

const Tenant = await pickDefault(import('./Tenant.js'));

describe('Tenant', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call middleware factories for user tenants', async () => {
    await Tenant.create({ id: defaultTenantId, redisCache: new RedisCache() });

    for (const [, middleware, shouldCall] of userMiddlewareList) {
      if (shouldCall) {
        expect(middleware).toBeCalled();
      } else {
        expect(middleware).not.toBeCalled();
      }
    }
  });

  it('should call middleware factories for the admin tenant', async () => {
    await Tenant.create({ id: adminTenantId, redisCache: new RedisCache() });

    for (const [, middleware, shouldCall] of adminMiddlewareList) {
      if (shouldCall) {
        expect(middleware).toBeCalled();
      } else {
        expect(middleware).not.toBeCalled();
      }
    }
  });
});

describe('Tenant `.run()`', () => {
  it('should return a function ', async () => {
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache: new RedisCache() });
    expect(typeof tenant.run).toBe('function');
  });
});

describe('Tenant cache health check', () => {
  it('should set expiration timestamp in redis', async () => {
    const redisCache = new RedisCache();
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache });
    expect(typeof tenant.invalidateCache).toBe('function');

    Sinon.stub(tenant.wellKnownCache, 'set').value(jest.fn());

    await tenant.invalidateCache();
    expect(tenant.wellKnownCache.set).toBeCalledWith(
      'tenant-cache-expires-at',
      WellKnownCache.defaultKey,
      expect.any(Number)
    );
  });

  it('should be able to check the health of tenant cache', async () => {
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache: new RedisCache() });
    expect(typeof tenant.checkHealth).toBe('function');
    expect(await tenant.checkHealth()).toBe(true);

    // Stub the `wellKnownCache.get()` to set current timestamp as the tenant expiration timestamp
    Sinon.stub(tenant.wellKnownCache, 'get').value(jest.fn(async () => Date.now()));

    expect(await tenant.checkHealth()).toBe(false);
  });
});
