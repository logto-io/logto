import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { GlobalValues } from '@logto/shared';
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

const { getTenantId } = await import('./tenant.js');

const getTenantIdFirstElement = async (url: URL) => {
  const [tenantId] = await getTenantId(url);
  return tenantId;
};

describe('getTenantId()', () => {
  const backupEnv = process.env;

  afterEach(() => {
    process.env = backupEnv;
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
});
