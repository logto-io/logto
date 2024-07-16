import assert from 'node:assert';

import { RoleType } from '@logto/schemas';
import { HTTPError } from 'ky';

import { OrganizationApiTest } from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';
import { generateTestName } from '#src/utils.js';

describe('organization user APIs', () => {
  describe('organization get users', () => {
    const organizationApi = new OrganizationApiTest();
    const userApi = new UserApiTest();

    beforeAll(async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const createdUsers = await Promise.all(
        Array.from({ length: 30 }).map(async () => userApi.create({ username: generateTestName() }))
      );
      await organizationApi.addUsers(
        organization.id,
        createdUsers.map((user) => user.id)
      );
    });

    afterAll(async () => {
      await Promise.all([organizationApi.cleanUp(), userApi.cleanUp()]);
    });

    it('should be able to get organization users with pagination', async () => {
      const organizationId = organizationApi.organizations[0]!.id;
      const [users1, total1] = await organizationApi.getUsers(organizationId, {
        page: 1,
        page_size: 20,
      });
      const [users2, total2] = await organizationApi.getUsers(organizationId, {
        page: 2,
        page_size: 10,
      });
      expect(users2.length).toBe(10);
      expect(users2[0]?.id).not.toBeFalsy();
      expect(users2[0]?.id).toBe(users1[10]?.id);
      expect(total1).toBe(30);
      expect(total2).toBe(30);
    });

    it('should be able to get organization users with search', async () => {
      const organizationId = organizationApi.organizations[0]!.id;
      const username = generateTestName();
      const createdUser = await userApi.create({ username });

      await organizationApi.addUsers(organizationId, [createdUser.id]);
      const [users] = await organizationApi.getUsers(organizationId, {
        q: username,
      });
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject(createdUser);
    });

    it('should be able to get organization users with their roles', async () => {
      const organizationId = organizationApi.organizations[0]!.id;
      const user = userApi.users[0]!;

      const roles = await Promise.all([
        organizationApi.roleApi.create({ name: generateTestName() }),
        organizationApi.roleApi.create({ name: generateTestName() }),
      ]);
      const roleIds = roles.map(({ id }) => id);
      await organizationApi.addUserRoles(organizationId, user.id, roleIds);

      const [usersWithRoles] = await organizationApi.getUsers(organizationId, {
        q: user.username!,
      });
      expect(usersWithRoles).toHaveLength(1);
      expect(usersWithRoles[0]).toMatchObject(user);
      expect(usersWithRoles[0]!.organizationRoles).toHaveLength(2);
      expect(usersWithRoles[0]!.organizationRoles).toEqual(
        expect.arrayContaining(roles.map(({ id }) => expect.objectContaining({ id })))
      );
    });
  });

  describe('organization - user relations', () => {
    const organizationApi = new OrganizationApiTest();
    const userApi = new UserApiTest();

    afterEach(async () => {
      await Promise.all([organizationApi.cleanUp(), userApi.cleanUp()]);
    });

    it('should fail when try to add empty user list', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const response = await organizationApi
        .addUsers(organization.id, [])
        .catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(400);
    });

    it('should fail when try to add user to an organization that does not exist', async () => {
      const response = await organizationApi.addUsers('0', ['0']).catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
        expect.objectContaining({ code: 'entity.relation_foreign_key_not_found' })
      );
    });

    it('should be able to delete organization user', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });

      await organizationApi.addUsers(organization.id, [user.id]);
      await organizationApi.deleteUser(organization.id, user.id);
      const users = await organizationApi.getUsers(organization.id);
      expect(users).not.toContainEqual(user);
    });

    it('should fail when try to delete user from an organization that does not exist', async () => {
      const response = await organizationApi.deleteUser('0', '0').catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(404);
    });
  });

  describe('organization - user - organization role relations', () => {
    const organizationApi = new OrganizationApiTest();
    const { roleApi } = organizationApi;
    const userApi = new UserApiTest();

    afterEach(async () => {
      await Promise.all([organizationApi.cleanUp(), userApi.cleanUp()]);
    });

    it("should be able to add and get user's organization roles", async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });
      const [role1, role2] = await Promise.all([
        roleApi.create({ name: generateTestName() }),
        roleApi.create({ name: generateTestName() }),
      ]);

      const response = await organizationApi
        .addUserRoles(organization.id, user.id, [role1.id, role2.id])
        .catch((error: unknown) => error);

      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
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
      const user = await userApi.create({ username: generateTestName() });
      const [role1, role2] = await Promise.all([
        roleApi.create({ name: generateTestName() }),
        roleApi.create({ name: generateTestName() }),
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

    it('should be able to assign multiple roles to multiple users', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const [user1, user2] = await Promise.all([
        userApi.create({ username: generateTestName() }),
        userApi.create({ username: generateTestName() }),
      ]);
      const [role1, role2] = await Promise.all([
        roleApi.create({ name: generateTestName() }),
        roleApi.create({ name: generateTestName() }),
      ]);

      await organizationApi.addUsers(organization.id, [user1.id, user2.id]);
      await organizationApi.addUsersRoles(
        organization.id,
        [user1.id, user2.id],
        [role1.id, role2.id]
      );

      const [user1Roles, user2Roles] = await Promise.all([
        organizationApi.getUserRoles(organization.id, user1.id),
        organizationApi.getUserRoles(organization.id, user2.id),
      ]);

      expect(user1Roles).toContainEqual(expect.objectContaining({ id: role1.id }));
      expect(user1Roles).toContainEqual(expect.objectContaining({ id: role2.id }));
      expect(user2Roles).toContainEqual(expect.objectContaining({ id: role1.id }));
      expect(user2Roles).toContainEqual(expect.objectContaining({ id: role2.id }));
    });

    it('should automatically remove all roles when remove a user from an organization', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });
      const [role1, role2] = await Promise.all([
        roleApi.create({ name: generateTestName() }),
        roleApi.create({ name: generateTestName() }),
      ]);

      await organizationApi.addUsers(organization.id, [user.id]);
      await organizationApi.addUserRoles(organization.id, user.id, [role1.id, role2.id]);
      expect(await organizationApi.getUserRoles(organization.id, user.id)).toHaveLength(2);

      await organizationApi.deleteUser(organization.id, user.id);
      const response = await organizationApi
        .getUserRoles(organization.id, user.id)
        .catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(422); // Require membership
    });

    it('should fail when try to add or delete role to a user that does not exist', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const response = await organizationApi
        .addUserRoles(organization.id, '0', ['0'])
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
        expect.objectContaining({ code: 'organization.require_membership' })
      );

      const response2 = await organizationApi
        .deleteUserRole(organization.id, '0', '0')
        .catch((error: unknown) => error);
      assert(response2 instanceof HTTPError);
      expect(response2.response.status).toBe(422);
      expect(await response2.response.json()).toMatchObject(
        expect.objectContaining({ code: 'organization.require_membership' })
      );
    });

    it('should fail when try to add or delete role that does not exist', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });
      await organizationApi.addUsers(organization.id, [user.id]);
      const response = await organizationApi
        .addUserRoles(organization.id, user.id, ['0'])
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
        expect.objectContaining({ code: 'entity.relation_foreign_key_not_found' })
      );

      const response2 = await organizationApi
        .deleteUserRole(organization.id, user.id, '0')
        .catch((error: unknown) => error);
      assert(response2 instanceof HTTPError);
      expect(response2.response.status).toBe(404);
      expect(await response2.response.json()).toMatchObject(
        expect.objectContaining({ code: 'entity.not_found' })
      );
    });

    it('should fail when try to add role that is not user type', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });
      const role = await roleApi.create({
        name: generateTestName(),
        type: RoleType.MachineToMachine,
      });

      await organizationApi.addUsers(organization.id, [user.id]);
      const response = await organizationApi
        .addUserRoles(organization.id, user.id, [role.id])
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
        expect.objectContaining({ code: 'entity.db_constraint_violated' })
      );
    });

    it('should be able to get organization roles for a user with or without pagination', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });
      const roles = await Promise.all(
        Array.from({ length: 30 }).map(async () => roleApi.create({ name: generateTestName() }))
      );

      await organizationApi.addUsers(organization.id, [user.id]);
      await organizationApi.addUserRoles(
        organization.id,
        user.id,
        roles.map(({ id }) => id)
      );

      const roles1 = await organizationApi.getUserRoles(organization.id, user.id, {
        page: 1,
        page_size: 20,
      });
      const roles2 = await organizationApi.getUserRoles(organization.id, user.id, {
        page: 2,
        page_size: 10,
      });

      expect(roles1).toHaveLength(20);
      expect(roles2).toHaveLength(10);
      expect(roles2[0]?.id).toBe(roles1[10]?.id);
      expect(roles).toEqual(expect.arrayContaining(roles1));
      expect(roles).toEqual(expect.arrayContaining(roles2));

      const allRoles = await organizationApi.getUserRoles(organization.id, user.id);
      expect(allRoles).toHaveLength(30);
      expect(allRoles).toEqual(expect.arrayContaining(roles));
    });
  });

  describe('organization - user - organization role - organization scopes relation', () => {
    it('should be able to get organization scopes for a user with a specific role', async () => {
      const organizationApi = new OrganizationApiTest();
      const { roleApi, scopeApi } = organizationApi;
      const userApi = new UserApiTest();

      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });
      await organizationApi.addUsers(organization.id, [user.id]);

      const [role1, role2] = await Promise.all([
        roleApi.create({ name: generateTestName() }),
        roleApi.create({ name: generateTestName() }),
      ]);
      const [scope1, scope2] = await Promise.all([
        scopeApi.create({ name: generateTestName() }),
        scopeApi.create({ name: generateTestName() }),
      ]);

      // Assign scope1 and scope2 to role1
      await roleApi.addScopes(role1.id, [scope1.id, scope2.id]);
      // Assign scope1 to role2
      await roleApi.addScopes(role2.id, [scope1.id]);

      // Assign role1 to user
      await organizationApi.addUserRoles(organization.id, user.id, [role1.id]);
      const scopes = await organizationApi.getUserOrganizationScopes(organization.id, user.id);
      expect(
        scopes
          .map(({ name }) => name)
          .slice()
          .sort()
      ).toEqual([scope1.name, scope2.name].slice().sort());

      // Remove role1 and assign role2 to user
      await organizationApi.deleteUserRole(organization.id, user.id, role1.id);
      await organizationApi.addUserRoles(organization.id, user.id, [role2.id]);
      const newScopes = await organizationApi.getUserOrganizationScopes(organization.id, user.id);
      expect(newScopes.map(({ name }) => name)).toEqual([scope1.name]);
    });
  });
});
