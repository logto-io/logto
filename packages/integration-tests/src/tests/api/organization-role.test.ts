import assert from 'node:assert';

import { generateStandardId } from '@logto/shared';
import { isKeyInObject } from '@silverhand/essentials';
import { HTTPError } from 'got';

import { roleApi } from '#src/api/organization-role.js';
import { scopeApi } from '#src/api/organization-scope.js';

const randomId = () => generateStandardId(4);

// Add additional layer of describe to run tests in band
describe('organization role APIs', () => {
  describe('organization roles', () => {
    it('should fail if the name of the new organization role already exists', async () => {
      const name = 'test' + randomId();
      const createdRole = await roleApi.create({ name });
      const response = await roleApi.create({ name }).catch((error: unknown) => error);

      assert(response instanceof HTTPError);

      const { statusCode, body: raw } = response.response;
      const body: unknown = JSON.parse(String(raw));
      expect(statusCode).toBe(400);
      expect(isKeyInObject(body, 'code') && body.code).toBe(
        'entity.duplicate_value_of_unique_field'
      );

      await roleApi.delete(createdRole.id);
    });

    it('should be able to create a role with some scopes', async () => {
      const name = 'test' + randomId();
      const scopes = await Promise.all(
        Array.from({ length: 20 }).map(async () => scopeApi.create({ name: 'test' + randomId() }))
      );
      const organizationScopeIds = scopes.map((scope) => scope.id);
      const role = await roleApi.create({ name, organizationScopeIds });

      const roleScopes = await roleApi.getScopes(role.id);
      expect(roleScopes).toHaveLength(20);

      // Check pagination
      const roleScopes2 = await roleApi.getScopes(
        role.id,
        new URLSearchParams({
          page: '2',
          page_size: '10',
        })
      );

      expect(roleScopes2).toHaveLength(10);
      expect(roleScopes2[0]?.id).not.toBeFalsy();
      expect(roleScopes2[0]?.id).toBe(roleScopes[10]?.id);

      await Promise.all(scopes.map(async (scope) => scopeApi.delete(scope.id)));
      await roleApi.delete(role.id);
    });

    it('should get organization roles successfully', async () => {
      const [name1, name2] = ['test' + randomId(), 'test' + randomId()];
      const createdRoles = await Promise.all([
        roleApi.create({ name: name1, description: 'A test organization role.' }),
        roleApi.create({ name: name2 }),
      ]);
      const roles = await roleApi.getList();

      expect(roles).toContainEqual(
        expect.objectContaining({ name: name1, description: 'A test organization role.' })
      );
      expect(roles).toContainEqual(expect.objectContaining({ name: name2, description: null }));

      await Promise.all(createdRoles.map(async (role) => roleApi.delete(role.id)));
    });

    it('should get organization roles with pagination', async () => {
      // Add 20 roles to exceed the default page size
      const allRoles = await Promise.all(
        Array.from({ length: 30 }).map(async () => roleApi.create({ name: 'test' + randomId() }))
      );

      const roles = await roleApi.getList();
      expect(roles).toHaveLength(20);

      const roles2 = await roleApi.getList(
        new URLSearchParams({
          page: '2',
          page_size: '10',
        })
      );
      expect(roles2.length).toBeGreaterThanOrEqual(10);
      expect(roles2[0]?.id).not.toBeFalsy();
      expect(roles2[0]?.id).toBe(roles[10]?.id);

      await Promise.all(allRoles.map(async (role) => roleApi.delete(role.id)));
    });

    it('should be able to create and get organization roles by id', async () => {
      const createdRole = await roleApi.create({ name: 'test' + randomId() });
      const role = await roleApi.get(createdRole.id);

      expect(role).toStrictEqual(createdRole);
      await roleApi.delete(createdRole.id);
    });

    it('should fail when try to get an organization role that does not exist', async () => {
      const response = await roleApi.get('0').catch((error: unknown) => error);

      expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
    });

    it('should be able to update organization role', async () => {
      const createdRole = await roleApi.create({ name: 'test' + randomId() });
      const newName = 'test' + randomId();
      const role = await roleApi.update(createdRole.id, {
        name: newName,
        description: 'test description.',
      });
      expect(role).toStrictEqual({
        ...createdRole,
        name: newName,
        description: 'test description.',
      });
      await roleApi.delete(createdRole.id);
    });

    it('should be able to delete organization role', async () => {
      const createdRole = await roleApi.create({ name: 'test' + randomId() });
      await roleApi.delete(createdRole.id);
      const response = await roleApi.get(createdRole.id).catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
    });

    it('should fail when try to delete an organization role that does not exist', async () => {
      const response = await roleApi.delete('0').catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
    });
  });

  describe('organization role - scope relations', () => {
    it('should be able to add and get scopes of a role', async () => {
      const [role, scope1, scope2] = await Promise.all([
        roleApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
      ]);
      await roleApi.addScopes(role.id, [scope1.id, scope2.id]);
      const scopes = await roleApi.getScopes(role.id);

      expect(scopes).toContainEqual(
        expect.objectContaining({
          name: scope1.name,
        })
      );
      expect(scopes).toContainEqual(
        expect.objectContaining({
          name: scope2.name,
        })
      );

      await Promise.all([
        roleApi.delete(role.id),
        scopeApi.delete(scope1.id),
        scopeApi.delete(scope2.id),
      ]);
    });

    it('should be able to remove scopes from a role', async () => {
      const [role, scope1, scope2] = await Promise.all([
        roleApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
      ]);
      await roleApi.addScopes(role.id, [scope1.id, scope2.id]);
      await roleApi.deleteScope(role.id, scope1.id);
      const scopes = await roleApi.getScopes(role.id);

      expect(scopes).not.toContainEqual(
        expect.objectContaining({
          name: scope1.name,
        })
      );
      expect(scopes).toContainEqual(
        expect.objectContaining({
          name: scope2.name,
        })
      );

      await Promise.all([
        roleApi.delete(role.id),
        scopeApi.delete(scope1.id),
        scopeApi.delete(scope2.id),
      ]);
    });
  });
});
