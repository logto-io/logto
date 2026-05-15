import assert from 'node:assert';

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
      // Create users sequentially to avoid database connection pool exhaustion
      const createdUsers = [];
      for (const _index of Array.from({ length: 30 })) {
        // eslint-disable-next-line no-await-in-loop
        const user = await userApi.create({ username: generateTestName() });
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        createdUsers.push(user);
      }
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
      /**
       * Exclude `hasPassword` field since the user type returned by the organization user API is not `userProfileResponse`.
       * So the `hasPassword` field will not be included in the user object.
       */
      const { hasPassword, ...createdUser } = await userApi.create({ username });

      await organizationApi.addUsers(organizationId, [createdUser.id]);
      const [users] = await organizationApi.getUsers(organizationId, {
        q: username,
      });
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject(createdUser);
    });

    it('should be able to get organization users with their roles', async () => {
      const organizationId = organizationApi.organizations[0]!.id;
      /**
       * Exclude `hasPassword` field since the user type returned by the organization user API is not `userProfileResponse`.
       * So the `hasPassword` field will not be included in the user object.
       */
      const { hasPassword, ...user } = userApi.users[0]!;

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

      const addUsersResult = await organizationApi.addUsers(organization.id, [user.id]);
      expect(addUsersResult).toEqual({ userIds: [user.id] });
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

  describe('PUT /organizations/:id/users delta semantics', () => {
    const organizationApi = new OrganizationApiTest();
    const userApi = new UserApiTest();

    afterEach(async () => {
      await Promise.all([organizationApi.cleanUp(), userApi.cleanUp()]);
    });

    it('should make zero changes when PUT body matches the current membership exactly', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const [userA, userB] = await Promise.all([
        userApi.create({ username: generateTestName() }),
        userApi.create({ username: generateTestName() }),
      ]);

      await organizationApi.addUsers(organization.id, [userA.id, userB.id]);
      const [usersBefore, totalBefore] = await organizationApi.getUsers(organization.id);
      const idsBefore = usersBefore
        .map(({ id }) => id)
        .slice()
        .sort();

      // A no-op PUT must still succeed and must not change the membership.
      await organizationApi.replaceUsers(organization.id, [userA.id, userB.id]);

      const [usersAfter, totalAfter] = await organizationApi.getUsers(organization.id);
      expect(totalAfter).toBe(totalBefore);
      expect(
        usersAfter
          .map(({ id }) => id)
          .slice()
          .sort()
      ).toEqual(idsBefore);
    });

    it('should add only new members and remove only departing members on a partial-overlap PUT', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const [userKeep, userDrop, userAdd] = await Promise.all([
        userApi.create({ username: generateTestName() }),
        userApi.create({ username: generateTestName() }),
        userApi.create({ username: generateTestName() }),
      ]);

      // Initial membership: { userKeep, userDrop }.
      await organizationApi.addUsers(organization.id, [userKeep.id, userDrop.id]);

      // Target membership: { userKeep, userAdd }. So userDrop leaves, userAdd joins, userKeep stays.
      await organizationApi.replaceUsers(organization.id, [userKeep.id, userAdd.id]);

      const [users, totalCount] = await organizationApi.getUsers(organization.id);
      expect(totalCount).toBe(2);
      expect(
        users
          .map(({ id }) => id)
          .slice()
          .sort()
      ).toEqual([userKeep.id, userAdd.id].slice().sort());
    });

    it('should remove all members when PUT body is empty', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const [userA, userB] = await Promise.all([
        userApi.create({ username: generateTestName() }),
        userApi.create({ username: generateTestName() }),
      ]);
      await organizationApi.addUsers(organization.id, [userA.id, userB.id]);

      await organizationApi.replaceUsers(organization.id, []);

      const [users, totalCount] = await organizationApi.getUsers(organization.id);
      expect(totalCount).toBe(0);
      expect(users).toEqual([]);
    });

    it('should add all members when PUT body has no overlap with current membership', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const [userA, userB] = await Promise.all([
        userApi.create({ username: generateTestName() }),
        userApi.create({ username: generateTestName() }),
      ]);
      // Start with an empty membership; PUT in two new users.
      await organizationApi.replaceUsers(organization.id, [userA.id, userB.id]);

      const [users, totalCount] = await organizationApi.getUsers(organization.id);
      expect(totalCount).toBe(2);
      expect(
        users
          .map(({ id }) => id)
          .slice()
          .sort()
      ).toEqual([userA.id, userB.id].slice().sort());
    });

    it('should preserve role assignments of members whose membership survives a PUT', async () => {
      // This is the cascade-correctness regression test. Master's full-rewrite `replace()`
      // ran `DELETE WHERE org_id = X` which cascaded to `organization_role_user_relations`,
      // dropping every member's roles on every PUT — even no-op PUTs. `replaceWithDelta()`
      // only deletes rows for members actually leaving, so surviving members keep their roles.
      const organization = await organizationApi.create({ name: 'test' });
      const [userKeep, userDrop] = await Promise.all([
        userApi.create({ username: generateTestName() }),
        userApi.create({ username: generateTestName() }),
      ]);
      const role = await organizationApi.roleApi.create({ name: generateTestName() });

      await organizationApi.addUsers(organization.id, [userKeep.id, userDrop.id]);
      await organizationApi.addUserRoles(organization.id, userKeep.id, [role.id]);

      // Sanity-check the role was assigned.
      const rolesBefore = await organizationApi.getUserRoles(organization.id, userKeep.id);
      expect(rolesBefore.map(({ id }) => id)).toEqual([role.id]);

      // PUT that drops userDrop but keeps userKeep. userKeep's role assignment must survive.
      await organizationApi.replaceUsers(organization.id, [userKeep.id]);

      const rolesAfter = await organizationApi.getUserRoles(organization.id, userKeep.id);
      expect(rolesAfter.map(({ id }) => id)).toEqual([role.id]);
    });
  });
});
