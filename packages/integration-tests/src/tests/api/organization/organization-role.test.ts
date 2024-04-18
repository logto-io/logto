import assert from 'node:assert';

import { generateStandardId } from '@logto/shared';
import { isKeyInObject, pick } from '@silverhand/essentials';
import { HTTPError } from 'ky';

import { OrganizationRoleApiTest, OrganizationScopeApiTest } from '#src/helpers/organization.js';
import { ScopeApiTest } from '#src/helpers/resource.js';

const randomId = () => generateStandardId(4);

// Add additional layer of describe to run tests in band
describe('organization role APIs', () => {
  describe('organization roles', () => {
    const roleApi = new OrganizationRoleApiTest();
    const scopeApi = new OrganizationScopeApiTest();
    const resourceScopeApi = new ScopeApiTest();

    beforeAll(async () => {
      await resourceScopeApi.initResource();
    });

    afterAll(async () => {
      await resourceScopeApi.cleanUp();
    });

    afterEach(async () => {
      await Promise.all([roleApi.cleanUp(), scopeApi.cleanUp()]);
    });

    it('should fail if the name of the new organization role already exists', async () => {
      const name = 'test' + randomId();
      await roleApi.create({ name });
      const response = await roleApi.create({ name }).catch((error: unknown) => error);

      assert(response instanceof HTTPError);

      const body: unknown = await response.response.json();
      expect(response.response.status).toBe(422);
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

    it('should be able to get organization roles with search keyword', async () => {
      const [name1, name2] = ['test' + randomId(), 'test' + randomId()];
      await Promise.all([
        roleApi.create({ name: name1, description: 'A test organization role.' }),
        roleApi.create({ name: name2 }),
      ]);
      const roles = await roleApi.getList(new URLSearchParams({ q: name1 }));

      expect(roles).toHaveLength(1);
      expect(roles[0]).toHaveProperty('name', name1);
    });

    it('should be able to create and get organization roles by id', async () => {
      const createdRole = await roleApi.create({ name: 'test' + randomId() });
      const { scopes, ...role } = await roleApi.get(createdRole.id);

      expect(role).toStrictEqual(createdRole);
    });

    it('should be able to create a new organization with initial organization scopes and resource scopes', async () => {
      const [scope1, scope2] = await Promise.all([
        scopeApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
      ]);
      const [resourceScope1, resourceScope2] = await Promise.all([
        resourceScopeApi.create({ name: 'test' + randomId() }),
        resourceScopeApi.create({ name: 'test' + randomId() }),
      ]);
      const createdRole = await roleApi.create({
        name: 'test' + randomId(),
        description: 'test description.',
        organizationScopeIds: [scope1.id, scope2.id],
        resourceScopeIds: [resourceScope1.id, resourceScope2.id],
      });
      const scopes = await roleApi.getScopes(createdRole.id);
      const resourceScopes = await roleApi.getResourceScopes(createdRole.id);
      const roles = await roleApi.getList();
      const roleWithScopes = roles.find((role) => role.id === createdRole.id);

      for (const scope of [scope1, scope2]) {
        expect(roleWithScopes?.scopes).toContainEqual(
          expect.objectContaining(pick(scope, 'id', 'name'))
        );
        expect(scopes).toContainEqual(expect.objectContaining(pick(scope, 'id', 'name')));
      }

      for (const scope of [resourceScope1, resourceScope2]) {
        expect(roleWithScopes?.resourceScopes).toContainEqual(
          expect.objectContaining(pick(scope, 'id', 'name'))
        );
        expect(resourceScopes).toContainEqual(expect.objectContaining(pick(scope, 'id', 'name')));
      }
    });

    it('should fail when try to get an organization role that does not exist', async () => {
      const response = await roleApi.get('0').catch((error: unknown) => error);

      expect(response instanceof HTTPError && response.response.status).toBe(404);
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
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
        expect.objectContaining({
          code: 'entity.unique_integrity_violation',
        })
      );
    });

    it('should be able to delete organization role', async () => {
      const createdRole = await roleApi.create({ name: 'test' + randomId() });
      await roleApi.delete(createdRole.id);
      const response = await roleApi.get(createdRole.id).catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(404);
    });

    it('should fail when try to delete an organization role that does not exist', async () => {
      const response = await roleApi.delete('0').catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(404);
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
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
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
      const role = await roleApi.create({ name: 'test' + randomId() });

      const response = await roleApi.deleteScope(role.id, '0').catch((error: unknown) => error);

      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(404);
    });
  });

  describe('organization role - resource scope relations', () => {
    const roleApi = new OrganizationRoleApiTest();
    const scopeApi = new ScopeApiTest();

    beforeEach(async () => {
      await scopeApi.initResource();
    });

    afterEach(async () => {
      await Promise.all([roleApi.cleanUp(), scopeApi.cleanUp()]);
    });

    it('should be able to add and get scopes of a role', async () => {
      const [role, scope1, scope2] = await Promise.all([
        roleApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
        scopeApi.create({ name: 'test' + randomId() }),
      ]);
      await roleApi.addResourceScopes(role.id, [scope1.id, scope2.id]);
      const scopes = await roleApi.getResourceScopes(role.id);

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

      await roleApi.addResourceScopes(role.id, [scope1.id, scope2.id]);

      await expect(roleApi.addResourceScopes(role.id, [scope2.id])).resolves.not.toThrow();

      const scopes = await roleApi.getResourceScopes(role.id);

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
        .addResourceScopes(role.id, [scope1.id, scope2.id, '0'])
        .catch((error: unknown) => error);

      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
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
      await roleApi.addResourceScopes(role.id, [scope1.id, scope2.id]);
      await roleApi.deleteResourceScope(role.id, scope1.id);
      const scopes = await roleApi.getResourceScopes(role.id);

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
      const role = await roleApi.create({ name: 'test' + randomId() });

      const response = await roleApi
        .deleteResourceScope(role.id, '0')
        .catch((error: unknown) => error);

      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(404);
    });
  });
});
