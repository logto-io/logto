import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import GlobalValues from '#src/env-set/GlobalValues.js';

const { jest } = import.meta;

const { mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    get values() {
      return new GlobalValues();
    },
  },
}));

const { getTenantId } = await import('./tenant.js');

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

    expect(getTenantId(new URL('https://some.random.url'))).toBe('foo');

    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      INTEGRATION_TEST: 'true',
      DEVELOPMENT_TENANT_ID: 'bar',
    };

    expect(getTenantId(new URL('https://some.random.url'))).toBe('bar');
  });

  it('should resolve proper tenant ID for similar localhost endpoints', async () => {
    expect(getTenantId(new URL('http://localhost:3002/some/path////'))).toBe(adminTenantId);
    expect(getTenantId(new URL('http://localhost:30021/some/path'))).toBe(defaultTenantId);
    expect(getTenantId(new URL('http://localhostt:30021/some/path'))).toBe(defaultTenantId);
    expect(getTenantId(new URL('https://localhost:3002'))).toBe(defaultTenantId);
  });

  it('should resolve proper tenant ID for similar domain endpoints', async () => {
    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      ENDPOINT: 'https://foo.*.logto.mock/app',
    };

    expect(getTenantId(new URL('https://foo.foo.logto.mock/app///asdasd'))).toBe('foo');
    expect(getTenantId(new URL('https://foo.*.logto.mock/app'))).toBe(undefined);
    expect(getTenantId(new URL('https://foo.foo.logto.mockk/app///asdasd'))).toBe(undefined);
    expect(getTenantId(new URL('https://foo.foo.logto.mock/appp'))).toBe(undefined);
    expect(getTenantId(new URL('https://foo.foo.logto.mock:1/app/'))).toBe(undefined);
    expect(getTenantId(new URL('http://foo.foo.logto.mock/app'))).toBe(undefined);
    expect(getTenantId(new URL('https://user.foo.bar.logto.mock/app'))).toBe(undefined);
    expect(getTenantId(new URL('https://foo.bar.bar.logto.mock/app'))).toBe(undefined);
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

    expect(getTenantId(new URL('http://localhost:5000/app///asdasd'))).toBe(defaultTenantId);
    expect(getTenantId(new URL('http://localhost:3002/app///asdasd'))).toBe(undefined);
    expect(getTenantId(new URL('https://user.foo.logto.mock/app'))).toBe('foo');
    expect(getTenantId(new URL('https://user.admin.logto.mock/app//'))).toBe(undefined); // Admin endpoint is explicitly set
    expect(getTenantId(new URL('https://admin.logto.mock/app'))).toBe(adminTenantId);

    process.env = {
      ...backupEnv,
      NODE_ENV: 'production',
      PORT: '5000',
      ENDPOINT: 'https://user.*.logto.mock/app',
      ADMIN_DISABLE_LOCALHOST: '1',
    };
    expect(getTenantId(new URL('https://user.admin.logto.mock/app//'))).toBe('admin');
  });
});
