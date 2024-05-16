import { RoleType } from '@logto/schemas';
import { HTTPError } from 'ky';

import { createUser } from '#src/api/index.js';
import {
  assignUsersToRole,
  createRole,
  deleteUserFromRole,
  getRoles,
  getRoleUsers,
} from '#src/api/role.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUserProfile } from '#src/helpers/user.js';
import { generatePhone } from '#src/utils.js';

describe('roles users', () => {
  it('should get role users successfully and can get roles correctly (specifying exclude user)', async () => {
    const role = await createRole({});
    const user = await createUser(generateNewUserProfile({}));
    await assignUsersToRole([user.id], role.id);
    const users = await getRoleUsers(role.id);

    expect(users.length).toBe(1);
    expect(users[0]).toHaveProperty('id', user.id);

    const allRolesWithoutUsersRoles = await getRoles({ excludeUserId: user.id });
    expect(allRolesWithoutUsersRoles.find(({ id }) => id === role.id)).toBeUndefined();
  });

  it('should return 404 if role not found', async () => {
    const response = await getRoleUsers('not-found').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should assign users to role successfully', async () => {
    const role = await createRole({});
    const user1 = await createUser({
      username: 'username001',
      name: 'user001',
      primaryEmail: 'user001@logto.io',
    });

    // Can not create user with invalid phone number.
    await expectRejects(createUser({ name: 'user002', primaryPhone: '123456789' }), {
      code: 'user.invalid_phone',
      status: 422,
    });
    const user2 = await createUser({ name: 'user002', primaryPhone: generatePhone() });

    const user3 = await createUser({ username: 'username3', primaryEmail: 'user3@logto.io' });
    await assignUsersToRole([user1.id, user2.id, user3.id], role.id);

    // No assigned users satisfy the search keyword
    await expect(getRoleUsers(role.id, 'not-found')).resolves.toHaveLength(0);

    // Get right assigned users with search keyword
    const assignedUsersWithEmailDomainSuffix = await getRoleUsers(role.id, '@logto.io');
    expect(assignedUsersWithEmailDomainSuffix).toHaveLength(2);
    expect(assignedUsersWithEmailDomainSuffix.find(({ id }) => id === user2.id)).toBeUndefined();

    const assignedUsersWithAnotherKeyword = await getRoleUsers(role.id, 'user00');
    expect(assignedUsersWithAnotherKeyword).toHaveLength(2);
    expect(assignedUsersWithAnotherKeyword.find(({ id }) => id === user3.id)).toBeUndefined();

    // Empty search keyword should be ignored, all assigned users should be returned
    await expect(getRoleUsers(role.id, '')).resolves.toHaveLength(3);

    // Get all assigned users
    await expect(getRoleUsers(role.id)).resolves.toHaveLength(3);
  });

  it('should throw when assigning users to m2m role', async () => {
    const m2mRole = await createRole({ type: RoleType.MachineToMachine });
    const user = await createUser(generateNewUserProfile({}));
    await expectRejects(assignUsersToRole([user.id], m2mRole.id), {
      code: 'entity.db_constraint_violated',
      status: 422,
    });
    const users = await getRoleUsers(m2mRole.id);

    expect(users.length).toBe(0);
  });

  it('should fail when try to assign empty users', async () => {
    const role = await createRole({});
    const response = await assignUsersToRole([], role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(400);
  });

  it('should fail with invalid user input', async () => {
    const role = await createRole({});
    const response = await assignUsersToRole([''], role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(400);
  });

  it('should fail if role not found', async () => {
    const user = await createUser(generateNewUserProfile({}));
    const response = await assignUsersToRole([user.id], 'not-found').catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should fail if user not found', async () => {
    const role = await createRole({});
    const response = await assignUsersToRole(['not-found'], role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should remove user from role successfully', async () => {
    const role = await createRole({});
    const user = await createUser(generateNewUserProfile({}));
    await assignUsersToRole([user.id], role.id);
    const users = await getRoleUsers(role.id);
    expect(users.length).toBe(1);

    await deleteUserFromRole(user.id, role.id);

    const newUsers = await getRoleUsers(role.id);
    expect(newUsers.length).toBe(0);
  });

  it('should fail if role not found when trying to remove user from role', async () => {
    const user = await createUser(generateNewUserProfile({}));
    const response = await deleteUserFromRole(user.id, 'not-found').catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should fail if user not found when trying to remove user from role', async () => {
    const role = await createRole({});
    const response = await deleteUserFromRole('not-found', role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });
});
