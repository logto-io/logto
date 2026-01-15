import { createManagementApi } from '@logto/api/management';
import { ApplicationType, RoleType, defaultTenantId } from '@logto/schemas';
import { HTTPError } from 'ky';

import { assignRolesToApplication, createApplication } from '#src/api/application.js';
import {
  assignRolesToUser,
  getUserRoles,
  deleteRoleFromUser,
  putRolesToUser,
} from '#src/api/index.js';
import { createRole, getRoles } from '#src/api/role.js';
import { logtoUrl } from '#src/constants.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { generateRoleName, generateTestName, generateUsername } from '#src/utils.js';

describe('admin console user management (roles)', () => {
  it('should get empty list successfully', async () => {
    const user = await createUserByAdmin();

    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(0);
  });

  it('should successfully assign user role to user and get list, but failed to assign m2m role to user', async () => {
    const user = await createUserByAdmin();
    const role1 = await createRole({});
    const role2 = await createRole({});

    const m2mRole = await createRole({ type: RoleType.MachineToMachine });
    await expectRejects(assignRolesToUser(user.id, [m2mRole.id]), {
      code: 'user.invalid_role_type',
      status: 422,
    });

    const assignment = await assignRolesToUser(user.id, [role1.id, role2.id]);
    expect(assignment).toEqual({
      roleIds: [role1.id, role2.id],
      addedRoleIds: [role1.id, role2.id],
    });
    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(2);
    expect(roles.find(({ id }) => id === role1.id)).toBeDefined();

    // Empty keyword should be ignored, all assigned roles should be returned
    await expect(getUserRoles(user.id, '')).resolves.toHaveLength(2);

    // Get right assigned roles with search keyword
    const assignedRolesWithKeyword = await getUserRoles(user.id, role1.name);
    expect(assignedRolesWithKeyword).toHaveLength(1);
    expect(assignedRolesWithKeyword.find(({ id }) => id === role2.id)).toBeUndefined();
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

  it('should replace roles and return roleIds successfully', async () => {
    const user = await createUserByAdmin();
    const role1 = await createRole({});
    const role2 = await createRole({});

    await assignRolesToUser(user.id, [role1.id]);
    const replacement = await putRolesToUser(user.id, [role2.id]);

    expect(replacement.roleIds).toEqual([role2.id]);
    const roles = await getUserRoles(user.id);
    expect(roles.length).toBe(1);
    expect(roles[0]).toHaveProperty('id', role2.id);
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
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);
  });

  it('should assign and replace roles via management api client', async () => {
    const m2mApp = await createApplication(generateTestName(), ApplicationType.MachineToMachine);
    const [managementApiRole] = await getRoles({
      type: RoleType.MachineToMachine,
      search: '%Logto Management API access%',
    });

    if (!managementApiRole) {
      throw new Error('Management API access role not found.');
    }

    await assignRolesToApplication(m2mApp.id, [managementApiRole.id]);

    const { apiClient } = createManagementApi(defaultTenantId, {
      clientId: m2mApp.id,
      clientSecret: m2mApp.secret,
      baseUrl: logtoUrl,
    });

    const { POST: post, PUT: put } = apiClient as unknown as {
      POST: {
        (
          path: '/api/users',
          init: { body: { username: string; name: string } }
        ): Promise<{ data?: { id: string } }>;
        (
          path: '/api/roles',
          init: { body: { name: string; description: string; type: RoleType } }
        ): Promise<{ data?: { id: string; name: string } }>;
        (
          path: '/api/users/{userId}/roles',
          init: { params: { path: { userId: string } }; body: { roleIds: string[] } }
        ): Promise<{ data?: { roleIds: string[]; addedRoleIds: string[] } }>;
      };
      PUT: (
        path: '/api/users/{userId}/roles',
        init: { params: { path: { userId: string } }; body: { roleIds: string[] } }
      ) => Promise<{ data?: { roleIds: string[] } }>;
    };

    const username = generateUsername();
    const createdUser = await post('/api/users', {
      body: { username, name: username },
    });

    if (!createdUser.data) {
      throw new Error('Failed to create user.');
    }

    const createRoleWithClient = async () => {
      const roleName = generateRoleName();
      const response = await post('/api/roles', {
        body: { name: roleName, description: roleName, type: RoleType.User },
      });

      if (!response.data) {
        throw new Error('Failed to create role.');
      }

      return response.data;
    };

    const [role1, role2, role3] = await Promise.all([
      createRoleWithClient(),
      createRoleWithClient(),
      createRoleWithClient(),
    ]);

    const assignment = await post('/api/users/{userId}/roles', {
      params: { path: { userId: createdUser.data.id } },
      body: { roleIds: [role1.id, role2.id] },
    });

    expect(assignment.data).toEqual({
      roleIds: [role1.id, role2.id],
      addedRoleIds: [role1.id, role2.id],
    });

    const duplicatedAssignment = await post('/api/users/{userId}/roles', {
      params: { path: { userId: createdUser.data.id } },
      body: { roleIds: [role1.id, role2.id] },
    });

    expect(duplicatedAssignment.data).toEqual({
      roleIds: [role1.id, role2.id],
      addedRoleIds: [],
    });

    const replacement = await put('/api/users/{userId}/roles', {
      params: { path: { userId: createdUser.data.id } },
      body: { roleIds: [role3.id] },
    });

    expect(replacement.data).toEqual({ roleIds: [role3.id] });
  });
});
