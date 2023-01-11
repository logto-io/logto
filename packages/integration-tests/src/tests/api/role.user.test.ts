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

  it('should assign users to role successfully', async () => {
    const role = await createRole();
    const user1 = await createUser(generateNewUserProfile({}));
    const user2 = await createUser(generateNewUserProfile({}));
    await assignUsersToRole([user1.id, user2.id], role.id);
    const users = await getRoleUsers(role.id);

    expect(users.length).toBe(2);
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
});
