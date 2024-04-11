import { defaultManagementApi } from '@logto/schemas';
import { HTTPError } from 'ky';

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
    const role = await createRole({});
    const resource = await createResource();
    const scope = await createScope(resource.id);
    await assignScopesToRole([scope.id], role.id);
    const scopes = await getRoleScopes(role.id);

    expect(scopes.length).toBe(1);
    expect(scopes[0]).toHaveProperty('id', scope.id);
  });

  it('should return 404 if role not found', async () => {
    const response = await getRoleScopes('not-found').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should return empty if role has no scopes', async () => {
    const role = await createRole({});
    const scopes = await getRoleScopes(role.id);
    expect(scopes.length).toBe(0);
  });

  it('should assign scopes to role successfully', async () => {
    const role = await createRole({});
    const resource = await createResource();
    const scope1 = await createScope(resource.id);
    const scope2 = await createScope(resource.id);
    const scopes = await assignScopesToRole([scope1.id, scope2.id], role.id);

    expect(scopes.length).toBe(2);
  });

  it('should fail when try to assign empty scopes', async () => {
    const role = await createRole({});
    const response = await assignScopesToRole([], role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(400);
  });

  it('should fail with invalid scope input', async () => {
    const role = await createRole({});
    const response = await assignScopesToRole([''], role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(400);
  });

  it('should fail if role not found', async () => {
    const resource = await createResource();
    const scope = await createScope(resource.id);
    const response = await assignScopesToRole([scope.id], 'not-found').catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should fail if scope not found', async () => {
    const role = await createRole({});
    const response = await assignScopesToRole(['not-found'], role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should fail if scope already assigned to role', async () => {
    const role = await createRole({});
    const resource = await createResource();
    const scope1 = await createScope(resource.id);
    const scope2 = await createScope(resource.id);
    await assignScopesToRole([scope1.id], role.id);
    const response = await assignScopesToRole([scope1.id, scope2.id], role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status).toBe(422);
  });

  it('should fail if try to assign management API scope(s) to user role', async () => {
    // Create `RoleType.User` role by default if `type` is not specified.
    const userRole = await createRole({});
    const response = await assignScopesToRole(
      [defaultManagementApi.scopes[0]!.id],
      userRole.id
    ).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(400);
  });

  it('should remove scope from role successfully', async () => {
    const role = await createRole({});
    const resource = await createResource();
    const scope = await createScope(resource.id);
    await assignScopesToRole([scope.id], role.id);
    const scopes = await getRoleScopes(role.id);
    expect(scopes.length).toBe(1);

    await deleteScopeFromRole(scope.id, role.id);

    const newScopes = await getRoleScopes(role.id);
    expect(newScopes.length).toBe(0);
  });

  it('should fail when try to remove scope from role that is not assigned', async () => {
    const role = await createRole({});
    const resource = await createResource();
    const scope = await createScope(resource.id);
    const response = await deleteScopeFromRole(scope.id, role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should fail when try to remove scope from role that is not found', async () => {
    const resource = await createResource();
    const scope = await createScope(resource.id);
    const response = await deleteScopeFromRole(scope.id, 'not-found').catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should fail when try to assign a scope to an internal role', async () => {
    const resource = await createResource();
    const scope = await createScope(resource.id);
    const response = await assignScopesToRole([scope.id], defaultManagementApi.role.id).catch(
      (error: unknown) => error
    );

    expect(response instanceof HTTPError && response.response.status).toBe(403);
  });
});
