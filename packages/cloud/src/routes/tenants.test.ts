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
    library.createNewTenant.mockImplementationOnce(async (_, payload) => {
      return { ...tenant, ...payload };
    });

    await router.routes()(
      buildRequestAuthContext('POST /tenants', {
        body: { name: 'tenant_named', tag: TenantTag.Staging },
      })([CloudScope.CreateTenant]),
      async ({ json, status }) => {
        expect(json).toStrictEqual({ ...tenant, name: 'tenant_named', tag: TenantTag.Staging });
        expect(status).toBe(201);
      },
      createHttpContext()
    );
  });
});

describe('PATCH /api/tenants/:tenantId', () => {
  const library = new MockTenantsLibrary();
  const router = tenantsRoutes(library);

  it('should throw 403 when lack of permission', async () => {
    await expect(
      router.routes()(
        buildRequestAuthContext('PATCH /tenants/tenant_a', { body: {} })(),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should throw 404 operating unavailable tenants', async () => {
    const tenant: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    library.getAvailableTenants.mockResolvedValueOnce([tenant]);

    await expect(
      router.routes()(
        buildRequestAuthContext('PATCH /tenants/tenant_b', { body: {} })([
          CloudScope.ManageTenantSelf,
        ]),
        noop,
        createHttpContext()
      )
    ).rejects.toThrow();
  });

  it('should be able to update arbitrary tenant with `ManageTenant` scope', async () => {
    const tenant: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    library.updateTenantById.mockImplementationOnce(async (_, payload): Promise<TenantInfo> => {
      return { ...tenant, ...payload };
    });

    await router.routes()(
      buildRequestAuthContext('PATCH /tenants/tenant_a', {
        body: {
          name: 'tenant_b',
          tag: TenantTag.Staging,
        },
      })([CloudScope.ManageTenant]),
      async ({ json, status }) => {
        expect(json).toStrictEqual({ ...tenant, name: 'tenant_b', tag: TenantTag.Staging });
        expect(status).toBe(200);
      },
      createHttpContext()
    );
  });

  it('should be able to update available tenant with `ManageTenantSelf` scope', async () => {
    const tenant: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    library.getAvailableTenants.mockResolvedValueOnce([tenant]);
    library.updateTenantById.mockImplementationOnce(async (_, payload): Promise<TenantInfo> => {
      return { ...tenant, ...payload };
    });

    await router.routes()(
      buildRequestAuthContext('PATCH /tenants/tenant_a', {
        body: {
          name: 'tenant_b',
          tag: TenantTag.Staging,
        },
      })([CloudScope.ManageTenant]),
      async ({ json, status }) => {
        expect(json).toStrictEqual({ ...tenant, name: 'tenant_b', tag: TenantTag.Staging });
        expect(status).toBe(200);
      },
      createHttpContext()
    );
  });
});

describe('DELETE /api/tenants/:tenantId', () => {
  const library = new MockTenantsLibrary();
  const router = tenantsRoutes(library);

  it('should throw 403 when lack of permission', async () => {
    await expect(
      router.routes()(
        buildRequestAuthContext('DELETE /tenants/tenant_a', { body: {} })(),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should throw 404 operating unavailable tenants', async () => {
    const tenant: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    library.getAvailableTenants.mockResolvedValueOnce([tenant]);

    await expect(
      router.routes()(
        buildRequestAuthContext('DELETE /tenants/tenant_b', { body: {} })([
          CloudScope.ManageTenantSelf,
        ]),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 404 });
  });

  it('should be able to delete arbitrary tenant with `ManageTenant` scope', async () => {
    const tenant: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    library.deleteTenantById.mockResolvedValueOnce();

    await router.routes()(
      buildRequestAuthContext(`DELETE /tenants/${tenant.id}`)([CloudScope.ManageTenant]),
      async ({ json, status }) => {
        expect(json).toBeUndefined();
        expect(status).toBe(204);
      },
      createHttpContext()
    );
  });

  it('should be able to delete available tenant with `ManageTenantSelf` scope', async () => {
    const tenant: TenantInfo = {
      id: 'tenant_a',
      name: 'tenant_a',
      tag: TenantTag.Development,
      indicator: 'https://foo.bar',
    };
    library.getAvailableTenants.mockResolvedValueOnce([tenant]);
    library.deleteTenantById.mockResolvedValueOnce();

    await router.routes()(
      buildRequestAuthContext(`DELETE /tenants/${tenant.id}`)([CloudScope.ManageTenant]),
      async ({ json, status }) => {
        expect(json).toBeUndefined();
        expect(status).toBe(204);
      },
      createHttpContext()
    );
  });
});
