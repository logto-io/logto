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

    it('should dedup duplicate user IDs in the POST body and only insert one membership', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });

      // Three copies of the same user ID in the request body should produce a single
      // membership row, not three quota-consuming inserts. The response echoes the raw
      // request body unchanged (the dedup is internal-only).
      const result = await organizationApi.addUsers(organization.id, [user.id, user.id, user.id]);
      expect(result.userIds).toEqual([user.id, user.id, user.id]);

      const [users, totalCount] = await organizationApi.getUsers(organization.id);
      expect(totalCount).toBe(1);
      expect(users.map(({ id }) => id)).toEqual([user.id]);
    });

    it('should not consume quota for existing members when POST mixes duplicates and new IDs', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const existingUser = await userApi.create({ username: generateTestName() });
      const newUser = await userApi.create({ username: generateTestName() });

      await organizationApi.addUsers(organization.id, [existingUser.id]);

      // Realistic mis-behaving-client shape: duplicates of the existing member alongside
      // a genuinely new ID. Only `newUser` should be charged against quota; the rest
      // collapse to a no-op insert via ON CONFLICT DO NOTHING.
      const result = await organizationApi.addUsers(organization.id, [
        existingUser.id,
        existingUser.id,
        newUser.id,
        newUser.id,
      ]);
      expect(result.userIds).toEqual([existingUser.id, existingUser.id, newUser.id, newUser.id]);

      const [users, totalCount] = await organizationApi.getUsers(organization.id);
      expect(totalCount).toBe(2);
      expect(
        users
          .map(({ id }) => id)
          .slice()
          .sort()
      ).toEqual([existingUser.id, newUser.id].slice().sort());
    });

    it('should accept POST of an already-member user without error', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });

      // First add succeeds.
      await organizationApi.addUsers(organization.id, [user.id]);
      // Re-adding the same user must not throw 403 or surface a quota error: no new
      // row would be inserted (ON CONFLICT DO NOTHING) so no quota should be consumed.
      const result = await organizationApi.addUsers(organization.id, [user.id]);
      expect(result.userIds).toEqual([user.id]);

      const [, totalCount] = await organizationApi.getUsers(organization.id);
      expect(totalCount).toBe(1);
    });

    it('should dedup duplicate user IDs in the PUT body without a primary-key collision', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const user = await userApi.create({ username: generateTestName() });

      // PUT with duplicate IDs would otherwise hit a primary-key collision inside
      // `replace()` and inflate the quota delta. After dedup, replace sees a single
      // user and the org has exactly one member.
      await organizationApi.replaceUsers(organization.id, [user.id, user.id, user.id]);

      const [users, totalCount] = await organizationApi.getUsers(organization.id);
      expect(totalCount).toBe(1);
      expect(users.map(({ id }) => id)).toEqual([user.id]);
    });
  });
});
