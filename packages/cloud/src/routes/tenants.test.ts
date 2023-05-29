import type { TenantInfo } from '@logto/schemas';
import { CloudScope, TenantTag } from '@logto/schemas';

import { buildRequestAuthContext, createHttpContext } from '#src/test-utils/context.js';
import { noop } from '#src/test-utils/function.js';
import { MockTenantsLibrary } from '#src/test-utils/libraries.js';

import { tenantsRoutes } from './tenants.js';

describe('GET /api/tenants', () => {
  const library = new MockTenantsLibrary();
  const router = tenantsRoutes(library);

  it('should return whatever the library returns', async () => {
    const tenants: TenantInfo[] = [
      {
        id: 'tenant_a',
        name: 'tenant_a',
        tag: TenantTag.Development,
        indicator: 'https://foo.bar',
      },
    ];
    library.getAvailableTenants.mockResolvedValueOnce(tenants);

    await router.routes()(
      buildRequestAuthContext('GET /tenants')(),
      async ({ json, status }) => {
        expect(json).toBe(tenants);
        expect(status).toBe(200);
      },
      createHttpContext()
    );
  });
});

describe('POST /api/tenants', () => {
  const library = new MockTenantsLibrary();
  const router = tenantsRoutes(library);

  it('should throw 403 when lack of permission', async () => {
    await expect(
      router.routes()(
        buildRequestAuthContext('POST /tenants', {
          body: { name: 'tenant', tag: TenantTag.Development },
        })(),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should be able to create a new tenant', async () => {
    const tenant: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    library.getAvailableTenants.mockResolvedValueOnce([]);
    library.createNewTenant.mockResolvedValueOnce(tenant);

    await router.routes()(
      buildRequestAuthContext('POST /tenants', {
        body: { name: 'tenant_a', tag: TenantTag.Development },
      })([CloudScope.CreateTenant]),
      async ({ json, status }) => {
        expect(json).toBe(tenant);
        expect(status).toBe(201);
      },
      createHttpContext()
    );
  });

  it('should be able to create a new tenant with `create:tenant` scope even if user has a tenant', async () => {
    const tenantA: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    const tenantB: TenantInfo = {
      id: 'tenant_b',
      name: 'tenant_b',
      tag: TenantTag.Development,
      indicator: 'https://foo.baz',
    };
    library.getAvailableTenants.mockResolvedValueOnce([tenantA]);
    library.createNewTenant.mockResolvedValueOnce(tenantB);

    await router.routes()(
      buildRequestAuthContext('POST /tenants', {
        body: { name: 'tenant_b', tag: TenantTag.Development },
      })([CloudScope.CreateTenant]),
      async ({ json, status }) => {
        expect(json).toBe(tenantB);
        expect(status).toBe(201);
      },
      createHttpContext()
    );
  });

  it('should be able to create a new tenant with `manage:tenant` scope even if user has a tenant', async () => {
    const tenantA: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    const tenantB: TenantInfo = {
      id: 'tenant_b',
      name: 'tenant_b',
      tag: TenantTag.Development,
      indicator: 'https://foo.baz',
    };
    library.getAvailableTenants.mockResolvedValueOnce([tenantA]);
    library.createNewTenant.mockResolvedValueOnce(tenantB);

    await router.routes()(
      buildRequestAuthContext('POST /tenants', {
        body: { name: 'tenant_b', tag: TenantTag.Development },
      })([CloudScope.ManageTenant]),
      async ({ json, status }) => {
        expect(json).toBe(tenantB);
        expect(status).toBe(201);
      },
      createHttpContext()
    );
  });
});
