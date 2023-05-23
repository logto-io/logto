import {
  cloudApiIndicator,
  CloudScope,
  type Resource,
  type Scope,
  type Role,
} from '@logto/schemas';

import { authedAdminTenantApi } from '#src/api/api.js';
import {
  createTenantForAdminRole,
  getTenantsForAdminRole,
  createTenantForUserRole,
  getTenantsForUserRole,
} from '#src/api/tenant.js';
import { createUserAndSignInWithCloudClient } from '#src/helpers/admin-tenant.js';

describe('Tenant APIs', () => {
  it('should be able to create multiple tenants for `admin` role', async () => {
    const { client } = await createUserAndSignInWithCloudClient('admin');
    const accessToken = await client.getAccessToken(cloudApiIndicator);
    const tenant1 = await createTenantForAdminRole(accessToken);
    const tenant2 = await createTenantForAdminRole(accessToken);
    expect(tenant1).toHaveProperty('id');
    expect(tenant2).toHaveProperty('id');
    const tenants = await getTenantsForAdminRole(accessToken);
    expect(tenants.length).toBeGreaterThan(2);
    expect(tenants.find((tenant) => tenant.id === tenant1.id)).toBeDefined();
    expect(tenants.find((tenant) => tenant.id === tenant2.id)).toBeDefined();
  });

  it('should create only one tenant for `user` role', async () => {
    const { client } = await createUserAndSignInWithCloudClient('admin');
    const accessToken = await client.getAccessToken(cloudApiIndicator);
    const tenant1 = await createTenantForUserRole(accessToken);
    await expect(createTenantForUserRole(accessToken)).rejects.toThrow();
    expect(tenant1).toHaveProperty('id');
    const tenants = await getTenantsForUserRole(accessToken);
    expect(tenants.length).toEqual(1);
    expect(tenants.find((tenant) => tenant.id === tenant1.id)).toBeDefined();
  });

  it('`user` role should have `CloudScope.ManageOwnTenant` scope', async () => {
    const resources = await authedAdminTenantApi.get('resources').json<Resource[]>();
    const cloudApiResource = resources.find(({ indicator }) => indicator === cloudApiIndicator);
    expect(cloudApiResource).toBeDefined();
    const scopes = await authedAdminTenantApi
      .get(`resources/${cloudApiResource!.id}/scopes`)
      .json<Scope[]>();
    const manageOwnTenantScope = scopes.find((scope) => scope.name === CloudScope.ManageOwnTenant);
    expect(manageOwnTenantScope).toBeDefined();
    const roles = await authedAdminTenantApi.get('roles').json<Role[]>();
    const userRole = roles.find(({ name }) => name === 'user');
    expect(userRole).toBeDefined();
    const roleScopes = await authedAdminTenantApi
      .get(`roles/${userRole!.id}/scopes`)
      .json<Scope[]>();
    expect(roleScopes.find(({ id }) => id === manageOwnTenantScope!.id)).toBeDefined();
  });
});
