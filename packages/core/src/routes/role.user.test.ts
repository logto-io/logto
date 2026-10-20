import { pickDefault } from '@logto/shared/esm';

import { mockAdminUserRole, mockUser } from '#src/__mocks__/index.js';
import { type HookContextManager } from '#src/libraries/hook/context-manager.js';
import { koaManagementApiHooks } from '#src/middleware/koa-management-api-hooks.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockIdGenerators();

const roles = {
  findRoleById: jest.fn(),
};
const { findRoleById } = roles;

const users = {
  findUserById: jest.fn(),
  countUsers: jest.fn(async () => ({ count: 1 })),
  findUsers: jest.fn(async () => [mockUser]),
};

const usersRoles = {
  insertUsersRoles: jest.fn(),
  findUsersRolesByRoleId: jest.fn(),
  findFirstUsersRolesByRoleIdAndUserIds: jest.fn(),
  deleteUsersRolesByUserIdAndRoleId: jest.fn(),
};
const {
  insertUsersRoles,
  findUsersRolesByRoleId,
  deleteUsersRolesByUserIdAndRoleId,
  findFirstUsersRolesByRoleIdAndUserIds,
} = usersRoles;

const roleUserRoutes = await pickDefault(import('./role.user.js'));

const triggerDataHooks = jest.fn();

const tenantContext = new MockTenant(
  undefined,
  {
    usersRoles,
    users,
    roles,
  },
  undefined,
  { quota: createMockQuotaLibrary(), hooks: { triggerDataHooks } }
);

const getDataHookContextArray = () => {
  const contextManager = triggerDataHooks.mock.calls.at(-1)?.[1] as HookContextManager | undefined;

  return contextManager?.dataHookContextArray ?? [];
};

describe('role user routes', () => {
  const roleUserRequester = createRequester({
    middlewares: [koaManagementApiHooks(tenantContext.libraries.hooks)],
    authedRoutes: roleUserRoutes,
    tenantContext,
  });

  it('GET /roles/:id/users', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    findUsersRolesByRoleId.mockResolvedValueOnce([]);
    const response = await roleUserRequester.get(`/roles/${mockAdminUserRole.id}/users`);
    expect(response.status).toEqual(200);
    expect(response.body[0]).toHaveProperty('id', mockUser.id);
  });

  it('POST /roles/:id/users', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    findFirstUsersRolesByRoleIdAndUserIds.mockResolvedValueOnce(null);
    const response = await roleUserRequester.post(`/roles/${mockAdminUserRole.id}/users`).send({
      userIds: [mockUser.id],
    });
    expect(response.status).toEqual(201);
    expect(insertUsersRoles).toHaveBeenCalledWith([
      { id: mockId, userId: mockUser.id, roleId: mockAdminUserRole.id },
    ]);
  });

  it('DELETE /roles/:id/users/:userId', async () => {
    const response = await roleUserRequester.delete(
      `/roles/${mockAdminUserRole.id}/users/${mockUser.id}`
    );
    expect(response.status).toEqual(204);
    expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(
      mockUser.id,
      mockAdminUserRole.id
    );
  });

  describe('User.Roles.Updated hook', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('POST /roles/:id/users emits one event per user', async () => {
      findRoleById.mockResolvedValueOnce(mockAdminUserRole);
      const userIds = ['user-1', 'user-2'];

      const response = await roleUserRequester
        .post(`/roles/${mockAdminUserRole.id}/users`)
        .send({ userIds });

      expect(response.status).toEqual(201);
      const userRoleEvents = getDataHookContextArray().filter(
        ({ event }) => event === 'User.Roles.Updated'
      );
      expect(userRoleEvents).toHaveLength(2);
      expect(userRoleEvents).toEqual(
        expect.arrayContaining(
          userIds.map((userId) =>
            expect.objectContaining({
              event: 'User.Roles.Updated',
              userId,
              addedRoleIds: [mockAdminUserRole.id],
              removedRoleIds: [],
              matchedRoute: '/roles/:id/users',
              method: 'POST',
              status: 201,
            })
          )
        )
      );
    });

    it('DELETE /roles/:id/users/:userId reports the removed role', async () => {
      const response = await roleUserRequester.delete(
        `/roles/${mockAdminUserRole.id}/users/${mockUser.id}`
      );

      expect(response.status).toEqual(204);
      expect(getDataHookContextArray()).toContainEqual(
        expect.objectContaining({
          event: 'User.Roles.Updated',
          userId: mockUser.id,
          addedRoleIds: [],
          removedRoleIds: [mockAdminUserRole.id],
          matchedRoute: '/roles/:id/users/:userId',
          method: 'DELETE',
          status: 204,
        })
      );
    });
  });
});
