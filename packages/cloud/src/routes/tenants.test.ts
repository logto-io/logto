import type { TenantInfo } from '@logto/schemas';
import { CloudScope } from '@logto/schemas';

import { buildRequestAuthContext, createHttpContext } from '#src/test-utils/context.js';
import { noop } from '#src/test-utils/function.js';
import { MockTenantsLibrary } from '#src/test-utils/libraries.js';

import { createTenants } from './tenants.js';

describe('GET /api/tenants', () => {
  const library = new MockTenantsLibrary();
  const router = createTenants(library);

  it('should return whatever the library returns', async () => {
    const tenants: TenantInfo[] = [{ id: 'tenant_a', indicator: 'https://foo.bar' }];
    library.getAvailableTenants.mockResolvedValueOnce(tenants);

    await router.routes()(
      buildRequestAuthContext('GET /tenants')(),
      async ({ json }) => {
        expect(json).toBe(tenants);
      },
      createHttpContext()
    );
  });
});

describe('POST /api/tenants', () => {
  const library = new MockTenantsLibrary();
  const router = createTenants(library);

  it('should throw 403 when lack of permission', async () => {
    await expect(
      router.routes()(buildRequestAuthContext('POST /tenants')(), noop, createHttpContext())
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should throw 409 when user has a tenant', async () => {
    const tenant: TenantInfo = { id: 'tenant_a', indicator: 'https://foo.bar' };
    library.getAvailableTenants.mockResolvedValueOnce([tenant]);

    await expect(
      router.routes()(
        buildRequestAuthContext('POST /tenants')([CloudScope.CreateTenant]),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 409 });
  });

  it('should be able to create a new tenant', async () => {
    const tenant: TenantInfo = { id: 'tenant_a', indicator: 'https://foo.bar' };
    library.getAvailableTenants.mockResolvedValueOnce([]);
    library.createNewTenant.mockResolvedValueOnce(tenant);

    await router.routes()(
      buildRequestAuthContext('POST /tenants')([CloudScope.CreateTenant]),
      async ({ json }) => {
        expect(json).toBe(tenant);
      },
      createHttpContext()
    );
  });

  it('should be able to create a new tenant with `manage:tenant` scope even if user has a tenant', async () => {
    const tenantA: TenantInfo = { id: 'tenant_a', indicator: 'https://foo.bar' };
    const tenantB: TenantInfo = { id: 'tenant_b', indicator: 'https://foo.baz' };
    library.getAvailableTenants.mockResolvedValueOnce([tenantA]);
    library.createNewTenant.mockResolvedValueOnce(tenantB);

    await router.routes()(
      buildRequestAuthContext('POST /tenants')([CloudScope.ManageTenant]),
      async ({ json }) => {
        expect(json).toBe(tenantB);
      },
      createHttpContext()
    );
  });
});
