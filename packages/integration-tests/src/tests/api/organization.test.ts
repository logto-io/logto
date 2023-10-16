import assert from 'node:assert';

import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'got';

import { createUser, deleteUser } from '#src/api/admin-user.js';
import { roleApi } from '#src/api/organization-role.js';
import { organizationApi } from '#src/api/organization.js';

const randomId = () => generateStandardId(4);

// Add additional layer of describe to run tests in band
describe('organization APIs', () => {
  describe('organizations', () => {
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

      await Promise.all(
        organizations.map(async (organization) => organizationApi.delete(organization.id))
      );
    });

    it('should get organizations with pagination', async () => {
      // Add organizations to exceed the default page size
      const allOrganizations = await Promise.all(
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

      await Promise.all(
        allOrganizations.map(async (organization) => organizationApi.delete(organization.id))
      );
    });

    it('should be able to create and get organizations by id', async () => {
      const createdOrganization = await organizationApi.create({ name: 'test' });
      const organization = await organizationApi.get(createdOrganization.id);

      expect(organization).toStrictEqual(createdOrganization);
      await organizationApi.delete(createdOrganization.id);
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
      await organizationApi.delete(createdOrganization.id);
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
    it('should be able to add and get organization users', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const [user1, user2] = await Promise.all([
        createUser({ username: 'test' + randomId() }),
        createUser({ username: 'test' + randomId() }),
      ]);

      await organizationApi.addUsers(organization.id, [user1.id, user2.id]);
      const users = await organizationApi.getUsers(organization.id);
      expect(users).toContainEqual(expect.objectContaining({ id: user1.id }));
      expect(users).toContainEqual(expect.objectContaining({ id: user2.id }));
      await Promise.all([
        organizationApi.delete(organization.id),
        deleteUser(user1.id),
        deleteUser(user2.id),
      ]);
    });

    it('should be able to delete organization user', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await createUser({ username: 'test' + randomId() });

      await organizationApi.addUsers(organization.id, [user.id]);
      await organizationApi.deleteUser(organization.id, user.id);
      const users = await organizationApi.getUsers(organization.id);
      expect(users).not.toContainEqual(user);
      await Promise.all([organizationApi.delete(organization.id), deleteUser(user.id)]);
    });
  });

  describe('organization - user - organization role relation routes', () => {
    it("should be able to add and get user's organization roles", async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await createUser({ username: 'test' + randomId() });
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
      await Promise.all([
        organizationApi.delete(organization.id),
        deleteUser(user.id),
        roleApi.delete(role1.id),
        roleApi.delete(role2.id),
      ]);
    });
  });
});
