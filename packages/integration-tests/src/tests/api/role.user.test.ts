import { HTTPError } from 'got';

import { createUser } from '#src/api/index.js';
import { assignUsersToRole, createRole, deleteUserFromRole, getRoleUsers } from '#src/api/role.js';
import { generateNewUserProfile } from '#src/helpers/user.js';

describe('roles users', () => {
  it('should get role users successfully', async () => {
    const role = await createRole();
    const user = await createUser(generateNewUserProfile({}));
    await assignUsersToRole([user.id], role.id);
    const users = await getRoleUsers(role.id);

    expect(users.length).toBe(1);
    expect(users[0]).toHaveProperty('id', user.id);
  });

  it('should return 404 if role not found', async () => {
    const response = await getRoleUsers('not-found').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should assign users to role successfully', async () => {
    const role = await createRole();
    const user1 = await createUser(generateNewUserProfile({}));
    const user2 = await createUser(generateNewUserProfile({}));
    await assignUsersToRole([user1.id, user2.id], role.id);
    const users = await getRoleUsers(role.id);

    expect(users.length).toBe(2);
  });

  it('should fail when try to assign empty users', async () => {
    const role = await createRole();
    const response = await assignUsersToRole([], role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(400);
  });

  it('should fail with invalid user input', async () => {
    const role = await createRole();
    const response = await assignUsersToRole([''], role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(400);
  });

  it('should fail if role not found', async () => {
    const user = await createUser(generateNewUserProfile({}));
    const response = await assignUsersToRole([user.id], 'not-found').catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should fail if user not found', async () => {
    const role = await createRole();
    const response = await assignUsersToRole(['not-found'], role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should remove user from role successfully', async () => {
    const role = await createRole();
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
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should fail if user not found when trying to  remove user from role', async () => {
    const role = await createRole();
    const response = await deleteUserFromRole('not-found', role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });
});
