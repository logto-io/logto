import { defaultManagementApi } from '@logto/schemas';
import { HTTPError } from 'got';

import { createResource } from '#src/api/index.js';
import {
  assignScopesToRole,
  createRole,
  deleteScopeFromRole,
  getRoleScopes,
} from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';

describe('roles scopes', () => {
  it('should get role scopes successfully', async () => {
    const role = await createRole();
    const resource = await createResource();
    const scope = await createScope(resource.id);
    await assignScopesToRole([scope.id], role.id);
    const scopes = await getRoleScopes(role.id);

    expect(scopes.length).toBe(1);
    expect(scopes[0]).toHaveProperty('id', scope.id);
  });

  it('should assign scopes to role successfully', async () => {
    const role = await createRole();
    const resource = await createResource();
    const scope1 = await createScope(resource.id);
    const scope2 = await createScope(resource.id);
    const scopes = await assignScopesToRole([scope1.id, scope2.id], role.id);

    expect(scopes.length).toBe(2);
  });

  it('should remove scope from role successfully', async () => {
    const role = await createRole();
    const resource = await createResource();
    const scope = await createScope(resource.id);
    await assignScopesToRole([scope.id], role.id);
    const scopes = await getRoleScopes(role.id);
    expect(scopes.length).toBe(1);

    await deleteScopeFromRole(scope.id, role.id);

    const newScopes = await getRoleScopes(role.id);
    expect(newScopes.length).toBe(0);
  });

  it('should fail when try to assign a scope to an internal role', async () => {
    const resource = await createResource();
    const scope = await createScope(resource.id);
    const response = await assignScopesToRole([scope.id], defaultManagementApi.role.id).catch(
      (error: unknown) => error
    );

    expect(response instanceof HTTPError && response.response.statusCode).toBe(403);
  });
});
