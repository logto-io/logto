import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { GlobalValues, TtlCache } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;

const { mockEsmWithActual, mockEsm } = createMockUtils(jest);

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    get values() {
      return new GlobalValues();
    },
  },
}));

const findActiveDomain = jest.fn();
mockEsm('#src/queries/domains.js', () => ({
  createDomainsQueries: () => ({
    findActiveDomain,
  }),
}));

const mockRedisCache = new TtlCache<string, string>(60_000);
mockEsm('#src/caches/index.js', () => ({
  redisCache: mockRedisCache,
}));

const { getTenantId, clearCustomDomainCache, resetUnmatchedConsoleOriginWarning } = await import(
  './tenant.js'
);
const { devConsole } = await import('./console.js');

const getTenantIdFirstElement = async (url: URL) => {
  const [tenantId] = await getTenantId(url);
  return tenantId;
};

describe('getTenantId()', () => {
  const backupEnv = process.env;

  afterEach(() => {
    process.env = backupEnv;
    mockRedisCache.clear();
  });

  it('should resolve development tenant ID when needed', async () => {
    process.env = {
      ...backupEnv,
      NODE_ENV: 'test',
      DEVELOPMENT_TENANT_ID: 'foo',
    };

    await expect(getTenantIdFirstElement(new URL('https://some.random.url'))).resolves.toBe('foo');

    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      INTEGRATION_TEST: 'true',
      DEVELOPMENT_TENANT_ID: 'bar',
    };

    await expect(getTenantIdFirstElement(new URL('https://some.random.url'))).resolves.toBe('bar');
  });

  it('should resolve proper tenant ID for similar localhost endpoints', async () => {
    await expect(
      getTenantIdFirstElement(new URL('http://localhost:3002/some/path////'))
    ).resolves.toBe(adminTenantId);
    await expect(
      getTenantIdFirstElement(new URL('http://localhost:30021/some/path'))
    ).resolves.toBe(defaultTenantId);
    await expect(
      getTenantIdFirstElement(new URL('http://localhostt:30021/some/path'))
    ).resolves.toBe(defaultTenantId);
    await expect(getTenantIdFirstElement(new URL('https://localhost:3002'))).resolves.toBe(
      defaultTenantId
    );
  });

  it('should resolve proper tenant ID for similar domain endpoints', async () => {
    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      ENDPOINT: 'https://foo.*.logto.mock/app',
    };

    await expect(
      getTenantIdFirstElement(new URL('https://foo.foo.logto.mock/app///asdasd'))
    ).resolves.toBe('foo');
    await expect(getTenantIdFirstElement(new URL('https://foo.*.logto.mock/app'))).resolves.toBe(
      undefined
    );
    await expect(
      getTenantIdFirstElement(new URL('https://foo.foo.logto.mockk/app///asdasd'))
    ).resolves.toBe(undefined);
    await expect(getTenantIdFirstElement(new URL('https://foo.foo.logto.mock/appp'))).resolves.toBe(
      undefined
    );
    await expect(
      getTenantIdFirstElement(new URL('https://foo.foo.logto.mock:1/app/'))
    ).resolves.toBe(undefined);
    await expect(getTenantIdFirstElement(new URL('http://foo.foo.logto.mock/app'))).resolves.toBe(
      undefined
    );
    await expect(
      getTenantIdFirstElement(new URL('https://user.foo.bar.logto.mock/app'))
    ).resolves.toBe(undefined);
    await expect(
      getTenantIdFirstElement(new URL('https://foo.bar.bar.logto.mock/app'))
    ).resolves.toBe(undefined);
  });

  it('should resolve proper tenant ID if admin localhost is disabled', async () => {
    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      PORT: '5000',
      ENDPOINT: 'https://user.*.logto.mock/app',
      ADMIN_ENDPOINT: 'https://admin.logto.mock/app',
      ADMIN_DISABLE_LOCALHOST: '1',
    };

    await expect(
      getTenantIdFirstElement(new URL('http://localhost:5000/app///asdasd'))
    ).resolves.toBe(undefined);
    await expect(
      getTenantIdFirstElement(new URL('http://localhost:3002/app///asdasd'))
    ).resolves.toBe(undefined);
    await expect(getTenantIdFirstElement(new URL('https://user.foo.logto.mock/app'))).resolves.toBe(
      'foo'
    );
    await expect(
      getTenantIdFirstElement(new URL('https://user.admin.logto.mock/app//'))
    ).resolves.toBe(undefined); // Admin endpoint is explicitly set
    await expect(getTenantIdFirstElement(new URL('https://admin.logto.mock/app'))).resolves.toBe(
      adminTenantId
    );

    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      PORT: '5000',
      ENDPOINT: 'https://user.*.logto.mock/app',
      ADMIN_DISABLE_LOCALHOST: '1',
    };
    await expect(
      getTenantIdFirstElement(new URL('https://user.admin.logto.mock/app//'))
    ).resolves.toBe('admin');
  });

  it('should resolve proper tenant ID for path-based multi-tenancy', async () => {
    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      PORT: '5000',
      ENDPOINT: 'https://user.logto.mock/app',
      PATH_BASED_MULTI_TENANCY: '1',
    };

    await expect(
      getTenantIdFirstElement(new URL('http://localhost:5000/app///asdasd'))
    ).resolves.toBe('app');
    await expect(
      getTenantIdFirstElement(new URL('http://localhost:3002///bar///asdasd'))
    ).resolves.toBe(adminTenantId);
    await expect(getTenantIdFirstElement(new URL('https://user.foo.logto.mock/app'))).resolves.toBe(
      undefined
    );
    await expect(
      getTenantIdFirstElement(new URL('https://user.admin.logto.mock/app//'))
    ).resolves.toBe(undefined);
    await expect(getTenantIdFirstElement(new URL('https://user.logto.mock/app'))).resolves.toBe(
      undefined
    );
    await expect(
      getTenantIdFirstElement(new URL('https://user.logto.mock/app/admin'))
    ).resolves.toBe('admin');
  });

  it('should resolve proper custom domain', async () => {
    process.env = {
      ...backupEnv,
      ENDPOINT: 'https://foo.*.logto.mock/app',
      NODE_ENV: 'production',
    };
    findActiveDomain.mockResolvedValueOnce({ domain: 'logto.mock.com', tenantId: 'mock' });
    await expect(getTenantIdFirstElement(new URL('https://logto.mock.com'))).resolves.toBe('mock');
  });

  it('should discard a stale write-back when the domain cache is invalidated mid-lookup', async () => {
    process.env = {
      ...backupEnv,
      ENDPOINT: 'https://foo.*.logto.mock/app',
      NODE_ENV: 'production',
    };
    findActiveDomain
      .mockImplementationOnce(async () => {
        /**
         * The domain mutation lands while this lookup's database read is in flight, i.e. the
         * mapping returned below reflects pre-mutation state.
         */
        await clearCustomDomainCache('logto.mock.com');
        return { domain: 'logto.mock.com', tenantId: 'stale' };
      })
      .mockResolvedValueOnce({ domain: 'logto.mock.com', tenantId: 'fresh' });

    /** The in-flight lookup still resolves, but its result must not persist in the cache. */
    await expect(getTenantIdFirstElement(new URL('https://logto.mock.com'))).resolves.toBe('stale');
    await expect(getTenantIdFirstElement(new URL('https://logto.mock.com'))).resolves.toBe('fresh');

    /**
     * Served from the cache: both queued database results are already consumed, so a cache
     * miss here would resolve to `undefined`.
     */
    await expect(getTenantIdFirstElement(new URL('https://logto.mock.com'))).resolves.toBe('fresh');
  });

  const useProductionEnv = (extra: NodeJS.ProcessEnv = {}) => {
    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      ENDPOINT: 'https://logto.example.com',
      DEVELOPMENT_TENANT_ID: '',
      INTEGRATION_TEST: '',
      PATH_BASED_MULTI_TENANCY: '',
      ADMIN_DISABLE_LOCALHOST: '',
      ADMIN_ENDPOINT: '',
      ...extra,
    };
  };

  describe('unmatched console origin warning', () => {
    const warnSpy = jest.spyOn(devConsole, 'warn').mockReturnValue();

    beforeEach(() => {
      warnSpy.mockClear();
      resetUnmatchedConsoleOriginWarning();
    });

    afterAll(() => {
      warnSpy.mockRestore();
    });

    it('warns once when /console falls through to the default tenant', async () => {
      useProductionEnv();
      const url = new URL('https://alb.example.com/console');

      await expect(getTenantId(url)).resolves.toEqual([defaultTenantId, false]);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('https://alb.example.com'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not set'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ADMIN_ENDPOINT'));

      await expect(getTenantId(url)).resolves.toEqual([defaultTenantId, false]);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('warns for nested console paths and names a mismatched ADMIN_ENDPOINT', async () => {
      useProductionEnv({
        ADMIN_ENDPOINT: 'https://internal.example.com/app',
        ADMIN_DISABLE_LOCALHOST: '1',
      });
      const url = new URL('https://alb.example.com/console/applications');

      await expect(getTenantId(url)).resolves.toEqual([defaultTenantId, false]);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('https://alb.example.com'));
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://internal.example.com/app')
      );
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ADMIN_ENDPOINT'));
    });

    it('returns the admin tenant without warning when the origin matches adminUrlSet', async () => {
      useProductionEnv({ ADMIN_ENDPOINT: 'https://admin.example.com' });

      await expect(getTenantId(new URL('https://admin.example.com/console'))).resolves.toEqual([
        adminTenantId,
        false,
      ]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('does not warn for a non-console path on the default tenant', async () => {
      useProductionEnv();

      await expect(getTenantId(new URL('https://alb.example.com/sign-in'))).resolves.toEqual([
        defaultTenantId,
        false,
      ]);
      await expect(getTenantId(new URL('https://alb.example.com/consolefoo'))).resolves.toEqual([
        defaultTenantId,
        false,
      ]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('does not warn in multi-tenancy', async () => {
      useProductionEnv({ ENDPOINT: 'https://*.logto.example.com' });

      await expect(getTenantId(new URL('https://alb.example.com/console'))).resolves.toEqual([
        undefined,
        false,
      ]);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
