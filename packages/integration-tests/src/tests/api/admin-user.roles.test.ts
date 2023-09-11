import { RoleType } from '@logto/schemas';
import { HTTPError } from 'got';

import { assignRolesToUser, getUserRoles, deleteRoleFromUser } from '#src/api/index.js';
import { createRole } from '#src/api/role.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';

describe('admin console user management (roles)', () => {
  it('should get empty list successfully', async () => {
    const user = await createUserByAdmin();

    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(0);
  });

  it('should successfully assign user role to user and get list, but failed to assign m2m role to user', async () => {
    const user = await createUserByAdmin();
    const role = await createRole({});

    const m2mRole = await createRole({ type: RoleType.MachineToMachine });
    await expectRejects(assignRolesToUser(user.id, [m2mRole.id]), {
      code: 'user.invalid_role_type',
      statusCode: 422,
    });

    await assignRolesToUser(user.id, [role.id]);
    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(1);
    expect(roles[0]).toHaveProperty('id', role.id);
  });

  it('should fail when assign duplicated role to user', async () => {
    const user = await createUserByAdmin();
    const role = await createRole({});

    await assignRolesToUser(user.id, [role.id]);
    await assignRolesToUser(user.id, [role.id]);
    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(1);
    expect(roles[0]).toHaveProperty('id', role.id);
  });

  it('should delete role from user successfully', async () => {
    const user = await createUserByAdmin();
    const role = await createRole({});

    await assignRolesToUser(user.id, [role.id]);
    await deleteRoleFromUser(user.id, role.id);

    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(0);
  });

  it('should delete non-exist-role from user failed', async () => {
    const user = await createUserByAdmin();
    const role = await createRole({});

    const response = await deleteRoleFromUser(user.id, role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });
});
