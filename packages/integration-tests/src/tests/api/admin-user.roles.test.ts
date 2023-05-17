import { HTTPError } from 'got';

import { assignRolesToUser, getUserRoles, deleteRoleFromUser } from '#src/api/index.js';
import { createRole } from '#src/api/role.js';
import { createResponseWithCode } from '#src/helpers/admin-tenant.js';
import { createUserByAdmin } from '#src/helpers/index.js';

describe('admin console user management (roles)', () => {
  it('should get empty list successfully', async () => {
    const user = await createUserByAdmin();

    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(0);
  });

  it('should assign role to user and get list successfully', async () => {
    const user = await createUserByAdmin();
    const role = await createRole();

    await assignRolesToUser(user.id, [role.id]);
    const roles = await getUserRoles(user.id);
    expect(roles[0]).toHaveProperty('id', role.id);
  });

  it('should fail when assign duplicated role to user', async () => {
    const user = await createUserByAdmin();
    const role = await createRole();

    await assignRolesToUser(user.id, [role.id]);
    await expect(assignRolesToUser(user.id, [role.id])).rejects.toMatchObject(
      createResponseWithCode(422)
    );
  });

  it('should delete role from user successfully', async () => {
    const user = await createUserByAdmin();
    const role = await createRole();

    await assignRolesToUser(user.id, [role.id]);
    await deleteRoleFromUser(user.id, role.id);

    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(0);
  });

  it('should delete non-exist-role from user failed', async () => {
    const user = await createUserByAdmin();
    const role = await createRole();

    const response = await deleteRoleFromUser(user.id, role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });
});
