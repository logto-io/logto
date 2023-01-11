import { adminConsoleAdminRoleId } from '@logto/schemas';
import { HTTPError } from 'got';

import { assignRolesToUser, getUserRoles, deleteRoleFromUser } from '#src/api/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';

describe('admin console user management (roles)', () => {
  it('should get empty list successfully', async () => {
    const user = await createUserByAdmin();

    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(0);
  });

  it('should assign role to user and get list successfully', async () => {
    const user = await createUserByAdmin();

    await assignRolesToUser(user.id, [adminConsoleAdminRoleId]);
    const roles = await getUserRoles(user.id);
    expect(roles[0]).toHaveProperty('id', adminConsoleAdminRoleId);
  });

  it('should delete role from user successfully', async () => {
    const user = await createUserByAdmin();

    await assignRolesToUser(user.id, [adminConsoleAdminRoleId]);
    await deleteRoleFromUser(user.id, adminConsoleAdminRoleId);

    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(0);
  });

  it('should delete non-exist-role from user failed', async () => {
    const user = await createUserByAdmin();

    const response = await deleteRoleFromUser(user.id, adminConsoleAdminRoleId).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });
});
