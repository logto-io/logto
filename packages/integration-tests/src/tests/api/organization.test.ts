import assert from 'node:assert';

import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'got';

import { OrganizationApiTest } from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';

const randomId = () => generateStandardId(4);

// Add additional layer of describe to run tests in band
describe('organization APIs', () => {
  describe('organizations', () => {
    const organizationApi = new OrganizationApiTest();

    afterEach(async () => {
      await organizationApi.cleanUp();
    });

    it('should get organizations successfully', async () => {
      await organizationApi.create({ name: 'test', description: 'A test organization.' });
      await organizationApi.create({ name: 'test2' });
      const organizations = await organizationApi.getList();

      expect(organizations).toContainEqual(
        expect.objectContaining({ name: 'test', description: 'A test organization.' })
      );
      expect(organizations).toContainEqual(
        expect.objectContaining({ name: 'test2', description: null })
      );
    });

    it('should get organizations with pagination', async () => {
      // Add organizations to exceed the default page size
      await Promise.all(
        Array.from({ length: 30 }).map(async () => organizationApi.create({ name: 'test' }))
      );

      const organizations = await organizationApi.getList();
      expect(organizations).toHaveLength(20);

      const organizations2 = await organizationApi.getList(
        new URLSearchParams({
          page: '2',
          page_size: '10',
        })
      );
      expect(organizations2.length).toBeGreaterThanOrEqual(10);
      expect(organizations2[0]?.id).not.toBeFalsy();
      expect(organizations2[0]?.id).toBe(organizations[10]?.id);
    });

    it('should be able to create and get organizations by id', async () => {
      const createdOrganization = await organizationApi.create({ name: 'test' });
      const organization = await organizationApi.get(createdOrganization.id);

      expect(organization).toStrictEqual(createdOrganization);
    });

    it('should fail when try to get an organization that does not exist', async () => {
      const response = await organizationApi.get('0').catch((error: unknown) => error);

      expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
    });

    it('should be able to update organization', async () => {
      const createdOrganization = await organizationApi.create({ name: 'test' });
      const organization = await organizationApi.update(createdOrganization.id, {
        name: 'test2',
        description: 'test description.',
      });
      expect(organization).toStrictEqual({
        ...createdOrganization,
        name: 'test2',
        description: 'test description.',
      });
    });

    it('should be able to delete organization', async () => {
      const createdOrganization = await organizationApi.create({ name: 'test' });
      await organizationApi.delete(createdOrganization.id);
      const response = await organizationApi
        .get(createdOrganization.id)
        .catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
    });

    it('should fail when try to delete an organization that does not exist', async () => {
      const response = await organizationApi.delete('0').catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
    });
  });

  describe('organization - user relations', () => {
    const organizationApi = new OrganizationApiTest();
    const userApi = new UserApiTest();

    afterEach(async () => {
      await Promise.all([organizationApi.cleanUp(), userApi.cleanUp()]);
    });

    it('should be able to add and get organization users', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const [user1, user2] = await Promise.all([
        userApi.create({ username: 'test' + randomId() }),
        userApi.create({ username: 'test' + randomId() }),
      ]);

      await organizationApi.addUsers(organization.id, [user1.id, user2.id]);
      const users = await organizationApi.getUsers(organization.id);
      expect(users).toContainEqual(expect.objectContaining({ id: user1.id }));
      expect(users).toContainEqual(expect.objectContaining({ id: user2.id }));
    });

    it('should fail when try to add empty user list', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const response = await organizationApi
        .addUsers(organization.id, [])
        .catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.statusCode).toBe(400);
    });

    it('should fail when try to add user to an organization that does not exist', async () => {
      const response = await organizationApi.addUsers('0', ['0']).catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.statusCode).toBe(422);
      expect(JSON.parse(String(response.response.body))).toMatchObject(
        expect.objectContaining({ code: 'entity.relation_foreign_key_not_found' })
      );
    });

    it('should be able to delete organization user', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: 'test' + randomId() });

      await organizationApi.addUsers(organization.id, [user.id]);
      await organizationApi.deleteUser(organization.id, user.id);
      const users = await organizationApi.getUsers(organization.id);
      expect(users).not.toContainEqual(user);
    });

    it('should fail when try to delete user from an organization that does not exist', async () => {
      const response = await organizationApi.deleteUser('0', '0').catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.statusCode).toBe(404);
    });
  });

  describe('organization - user - organization role relation routes', () => {
    const organizationApi = new OrganizationApiTest();
    const { roleApi } = organizationApi;
    const userApi = new UserApiTest();

    afterEach(async () => {
      await Promise.all([organizationApi.cleanUp(), userApi.cleanUp()]);
    });

    it("should be able to add and get user's organization roles", async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: 'test' + randomId() });
      const [role1, role2] = await Promise.all([
        roleApi.create({ name: 'test' + randomId() }),
        roleApi.create({ name: 'test' + randomId() }),
      ]);

      const response = await organizationApi
        .addUserRoles(organization.id, user.id, [role1.id, role2.id])
        .catch((error: unknown) => error);

      assert(response instanceof HTTPError);
      expect(response.response.statusCode).toBe(422);
      expect(JSON.parse(String(response.response.body))).toMatchObject(
        expect.objectContaining({ code: 'organization.require_membership' })
      );

      await organizationApi.addUsers(organization.id, [user.id]);
      await organizationApi.addUserRoles(organization.id, user.id, [role1.id, role2.id]);
      const roles = await organizationApi.getUserRoles(organization.id, user.id);
      expect(roles).toContainEqual(expect.objectContaining({ id: role1.id }));
      expect(roles).toContainEqual(expect.objectContaining({ id: role2.id }));
    });

    it('should be able to get all organizations with roles for a user', async () => {
      const [organization1, organization2] = await Promise.all([
        organizationApi.create({ name: 'test' }),
        organizationApi.create({ name: 'test' }),
      ]);
      const user = await userApi.create({ username: 'test' + randomId() });
      const [role1, role2] = await Promise.all([
        roleApi.create({ name: 'test' + randomId() }),
        roleApi.create({ name: 'test' + randomId() }),
      ]);

      await organizationApi.addUsers(organization1.id, [user.id]);
      await organizationApi.addUserRoles(organization1.id, user.id, [role1.id]);
      await organizationApi.addUsers(organization2.id, [user.id]);
      await organizationApi.addUserRoles(organization2.id, user.id, [role1.id, role2.id]);

      const organizations = await organizationApi.getUserOrganizations(user.id);

      // Check organization 1 and ensure it only has role 1
      const organization1WithRoles = organizations.find((org) => org.id === organization1.id);
      assert(organization1WithRoles);
      expect(organization1WithRoles.id).toBe(organization1.id);
      expect(organization1WithRoles.organizationRoles).toContainEqual(
        expect.objectContaining({ id: role1.id })
      );
      expect(organization1WithRoles.organizationRoles).not.toContainEqual(
        expect.objectContaining({ id: role2.id })
      );

      // Check organization 2 and ensure it has both role 1 and role 2
      const organization2WithRoles = organizations.find((org) => org.id === organization2.id);
      assert(organization2WithRoles);
      expect(organization2WithRoles.id).toBe(organization2.id);
      expect(organization2WithRoles.organizationRoles).toContainEqual(
        expect.objectContaining({ id: role1.id })
      );
      expect(organization2WithRoles.organizationRoles).toContainEqual(
        expect.objectContaining({ id: role2.id })
      );
    });
  });
});
