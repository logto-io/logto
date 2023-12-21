import assert from 'node:assert';

import { generateStandardId } from '@logto/shared';
import { isKeyInObject, pick } from '@silverhand/essentials';
import { HTTPError } from 'got';

import { OrganizationRoleApiTest, OrganizationScopeApiTest } from '#src/helpers/organization.js';

const randomId = () => generateStandardId(4);

// Add additional layer of describe to run tests in band
describe('organization role APIs', () => {
  describe('organization roles', () => {
    const roleApi = new OrganizationRoleApiTest();
    const scopeApi = new OrganizationScopeApiTest();

    afterEach(async () => {
      await Promise.all([roleApi.cleanUp(), scopeApi.cleanUp()]);
    });

    it('should fail if the name of the new organization role already exists', async () => {
      const name = 'test' + randomId();
      await roleApi.create({ name });
      const response = await roleApi.create({ name }).catch((error: unknown) => error);

      assert(response instanceof HTTPError);

      const { statusCode, body: raw } = response.response;
      const body: unknown = JSON.parse(String(raw));
      expect(statusCode).toBe(422);
      expect(isKeyInObject(body, 'code') && body.code).toBe('entity.unique_integrity_violation');
    });

    it('should get organization roles successfully', async () => {
      const [name1, name2] = ['test' + randomId(), 'test' + randomId()];
      await Promise.all([
        roleApi.create({ name: name1, description: 'A test organization role.' }),
        roleApi.create({ name: name2 }),
      ]);
      const roles = await roleApi.getList();

      expect(roles).toContainEqual(
        expect.objectContaining({ name: name1, description: 'A test organization role.' })
      );
      expect(roles).toContainEqual(expect.objectContaining({ name: name2, description: null }));
    });

    it('should get organization roles with pagination', async () => {
      // Add 20 roles to exceed the default page size
      await Promise.all(
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
    });

    it('should be able to create and get organization roles by id', async () => {
      const createdRole = await roleApi.create({ name: 'test' + randomId() });
      const { scopes, ...role } = await roleApi.get(createdRole.id);

      expect(role).toStrictEqual(createdRole);
    });

    it('should be able to create a new organization with initial scopes', async () => {
      const [scope1, scope2] = await Promise.all([
        scopeApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
      ]);
      const createdRole = await roleApi.create({
        name: 'test' + randomId(),
        description: 'test description.',
        organizationScopeIds: [scope1.id, scope2.id],
      });
      const scopes = await roleApi.getScopes(createdRole.id);
      const roles = await roleApi.getList();
      const roleWithScopes = roles.find((role) => role.id === createdRole.id);

      for (const scope of [scope1, scope2]) {
        expect(roleWithScopes?.scopes).toContainEqual(
          expect.objectContaining(pick(scope, 'id', 'name'))
        );
        expect(scopes).toContainEqual(expect.objectContaining(pick(scope, 'id', 'name')));
      }
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
    });

    it('should fail when try to update an organization role with a name that already exists', async () => {
      const [role1, role2] = await Promise.all([
        roleApi.create({ name: 'test' + randomId() }),
        roleApi.create({ name: 'test' + randomId() }),
      ]);
      const response = await roleApi
        .update(role1.id, {
          name: role2.name,
        })
        .catch((error: unknown) => error);

      assert(response instanceof HTTPError);
      expect(response.response.statusCode).toBe(422);
      expect(JSON.parse(String(response.response.body))).toMatchObject(
        expect.objectContaining({
          code: 'entity.unique_integrity_violation',
        })
      );
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
    const roleApi = new OrganizationRoleApiTest();
    const scopeApi = new OrganizationScopeApiTest();

    afterEach(async () => {
      await Promise.all([roleApi.cleanUp(), scopeApi.cleanUp()]);
    });

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
    });

    it('should safely add scopes to a role when some of them already exist', async () => {
      const [role, scope1, scope2] = await Promise.all([
        roleApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
      ]);

      await roleApi.addScopes(role.id, [scope1.id, scope2.id]);

      await expect(roleApi.addScopes(role.id, [scope2.id])).resolves.not.toThrow();

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
    });

    it('should fail when try to add non-existent scopes to a role', async () => {
      const [role, scope1, scope2] = await Promise.all([
        roleApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
      ]);
      const response = await roleApi
        .addScopes(role.id, [scope1.id, scope2.id, '0'])
        .catch((error: unknown) => error);

      assert(response instanceof HTTPError);
      expect(response.response.statusCode).toBe(422);
      expect(JSON.parse(String(response.response.body))).toMatchObject(
        expect.objectContaining({
          code: 'entity.relation_foreign_key_not_found',
        })
      );
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
    });

    it('should fail when try to remove non-existent scopes from a role', async () => {
      const [role] = await Promise.all([roleApi.create({ name: 'test' + randomId() })]);

      const response = await roleApi.deleteScope(role.id, '0').catch((error: unknown) => error);

      assert(response instanceof HTTPError);
      expect(response.response.statusCode).toBe(404);
    });
  });
});
