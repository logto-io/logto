import { HTTPError } from 'got';

import { createResource } from '#src/api/resource.js';
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  getRoleScopes,
  updateRole,
} from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { generateRoleName } from '#src/utils.js';

describe('roles', () => {
  it('should get roles list successfully', async () => {
    await createRole();
    const roles = await getRoles();

    expect(roles.length > 0).toBeTruthy();
  });

  it('should create role successfully', async () => {
    const roleName = generateRoleName();
    const description = roleName;

    const role = await createRole(roleName, description);

    expect(role.name).toBe(roleName);
    expect(role.description).toBe(description);
  });

  it('should create role with scopeIds successfully', async () => {
    const roleName = generateRoleName();
    const description = roleName;
    const resource = await createResource();
    const scope = await createScope(resource.id);

    const role = await createRole(roleName, description, [scope.id]);
    const scopes = await getRoleScopes(role.id);

    expect(role.name).toBe(roleName);
    expect(role.description).toBe(description);
    expect(scopes[0]).toHaveProperty('id', scope.id);
  });

  it('should fail when create role with conflict name', async () => {
    const createdRole = await createRole();

    const response = await createRole(createdRole.name).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(422);
  });

  it('should fail when try to create an internal role', async () => {
    const response = await createRole('#internal:foo').catch((error: unknown) => error);

    expect(response instanceof HTTPError && response.response.statusCode).toBe(403);
  });

  it('should get role detail successfully', async () => {
    const createdRole = await createRole();
    const role = await getRole(createdRole.id);

    expect(role.name).toBe(createdRole.name);
    expect(role.description).toBe(createdRole.description);
  });

  it('should update role details successfully', async () => {
    const role = await createRole();

    const newName = `new_${role.name}`;
    const newDescription = `new_${role.description}`;

    await updateRole(role.id, {
      name: newName,
      description: newDescription,
    });

    const updatedRole = await getRole(role.id);

    expect(updatedRole.name).toBe(newName);
    expect(updatedRole.description).toBe(newDescription);
  });

  it('should fail when update role with conflict name', async () => {
    const role1 = await createRole();
    const role2 = await createRole();
    const response = await updateRole(role2.id, {
      name: role1.name,
    }).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(422);
  });

  it('should delete role successfully', async () => {
    const role = await createRole();

    await deleteRole(role.id);

    const response = await getRole(role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });
});
