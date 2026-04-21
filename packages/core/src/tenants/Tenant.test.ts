import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import Sinon from 'sinon';

import { RedisCache } from '#src/caches/index.js';
import { WellKnownCache } from '#src/caches/well-known.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockWellKnownCache } from '#src/test-utils/tenant.js';
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
  it('should persist tenant invalidation state and mirror it to cache', async () => {
    const redisCache = new RedisCache();
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache });
    expect(typeof tenant.invalidateCache).toBe('function');

    const setTenantCacheExpiresAt = jest.fn(async () => ({
      tenantCacheExpiresAt: Date.now(),
      signingKeyRotationAt: 1_234_567_890,
    }));
    Sinon.stub(tenant.queries.logtoConfigs, 'setTenantCacheExpiresAt').value(
      setTenantCacheExpiresAt
    );
    Sinon.stub(tenant.wellKnownCache, 'set').value(jest.fn());
    Sinon.stub(tenant.wellKnownCache, 'delete').value(jest.fn());

    await tenant.invalidateCache();
    expect(setTenantCacheExpiresAt).toHaveBeenCalledTimes(1);
    const firstCall = setTenantCacheExpiresAt.mock.calls.at(0) as [number] | undefined;
    expect(firstCall).toBeDefined();
    expect(firstCall?.[0]).toEqual(expect.any(Number));
    expect(tenant.wellKnownCache.set).toBeCalledWith(
      'signing-key-rotation-state',
      WellKnownCache.defaultKey,
      expect.objectContaining({ signingKeyRotationAt: 1_234_567_890 })
    );
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

    Sinon.stub(tenant.queries.logtoConfigs, 'getSigningKeyRotationState').value(
      jest.fn(async () => ({ tenantCacheExpiresAt: Date.now() }))
    );

    expect(await tenant.checkHealth()).toBe(false);
  });

  it('prefers cached rotation state when checking tenant health', async () => {
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache: new RedisCache() });

    Sinon.stub(tenant.wellKnownCache, 'get').resolves({ tenantCacheExpiresAt: Date.now() });
    const getSigningKeyRotationState = jest.fn();
    Sinon.stub(tenant.queries.logtoConfigs, 'getSigningKeyRotationState').value(
      getSigningKeyRotationState
    );

    expect(await tenant.checkHealth()).toBe(false);
    expect(getSigningKeyRotationState).not.toHaveBeenCalled();
  });

  it('should persist delayed activation in rotation state', async () => {
    const redisBackedCache = {
      client: {},
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache: redisBackedCache });
    const setSigningKeyRotationAt = jest.fn(async () => ({
      tenantCacheExpiresAt: 2_222_222_222,
      signingKeyRotationAt: 1_234_567_890,
    }));

    Sinon.stub(tenant.queries.logtoConfigs, 'setSigningKeyRotationAt').value(
      setSigningKeyRotationAt
    );
    Sinon.stub(tenant.wellKnownCache, 'set').value(jest.fn());
    Sinon.stub(tenant.wellKnownCache, 'delete').value(jest.fn());

    await tenant.scheduleSigningKeyRotation(1_234_567_890);

    expect(setSigningKeyRotationAt).toHaveBeenCalledWith(1_234_567_890);
    expect(tenant.wellKnownCache.set).toHaveBeenCalledWith(
      'signing-key-rotation-state',
      WellKnownCache.defaultKey,
      {
        tenantCacheExpiresAt: 2_222_222_222,
        signingKeyRotationAt: 1_234_567_890,
      }
    );
    expect(tenant.wellKnownCache.set).toHaveBeenCalledWith(
      'tenant-cache-expires-at',
      WellKnownCache.defaultKey,
      2_222_222_222
    );
  });

  it('falls back to DB-backed rotation state when cached values are missing', async () => {
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache: new RedisCache() });
    const now = Date.now();
    Sinon.stub(tenant.wellKnownCache, 'get').resolves();
    Sinon.stub(tenant.wellKnownCache, 'set').value(jest.fn());
    Sinon.stub(tenant.wellKnownCache, 'delete').value(jest.fn());
    Sinon.stub(tenant.queries.logtoConfigs, 'getSigningKeyRotationState').value(
      jest.fn(async () => ({ tenantCacheExpiresAt: now }))
    );

    expect(await tenant.checkHealth()).toBe(false);
    expect(tenant.queries.logtoConfigs.getSigningKeyRotationState).toBeCalled();
    expect(tenant.wellKnownCache.set).toBeCalledWith(
      'signing-key-rotation-state',
      WellKnownCache.defaultKey,
      { tenantCacheExpiresAt: now }
    );
    expect(tenant.wellKnownCache.set).toBeCalledWith(
      'tenant-cache-expires-at',
      WellKnownCache.defaultKey,
      now
    );
  });

  it('caches the empty rotation state to avoid repeated DB misses', async () => {
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache: new RedisCache() });
    const localCache = new MockWellKnownCache();

    Sinon.stub(tenant, 'wellKnownCache').value(localCache);
    const getSigningKeyRotationState = Sinon.stub().resolves();
    Sinon.stub(tenant.queries.logtoConfigs, 'getSigningKeyRotationState').value(
      getSigningKeyRotationState as typeof tenant.queries.logtoConfigs.getSigningKeyRotationState
    );

    expect(await tenant.checkHealth()).toBe(true);
    expect(await tenant.checkHealth()).toBe(true);
    expect(getSigningKeyRotationState.calledOnce).toBe(true);
  });

  it('invalidates tenant instances when staged activation is due', async () => {
    const tenant = await Tenant.create({ id: defaultTenantId, redisCache: new RedisCache() });
    Sinon.stub(tenant.queries.logtoConfigs, 'getSigningKeyRotationState').value(
      jest.fn(async () => ({ signingKeyRotationAt: Date.now() - 1 }))
    );

    expect(await tenant.checkHealth()).toBe(false);
  });
});
