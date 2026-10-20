import { RoleType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockAdminUserRole,
  mockUser,
  mockAdminUserRole2,
  mockAdminUserRole3,
  mockUserRole,
} from '#src/__mocks__/index.js';
import { type HookContextManager } from '#src/libraries/hook/context-manager.js';
import { koaManagementApiHooks } from '#src/middleware/koa-management-api-hooks.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockIdGenerators();

const users = { findUserById: jest.fn() };

const roles = {
  findRolesByRoleIds: jest.fn(),
  findRoleById: jest.fn(),
  countRoles: jest.fn(async () => ({ count: 1 })),
  findRoles: jest.fn(async () => [mockAdminUserRole]),
};

const usersRoles = {
  findUsersRolesByUserId: jest.fn(),
  insertUsersRoles: jest.fn(),
  deleteUsersRolesByUserIdAndRoleId: jest.fn(),
};
const { findUsersRolesByUserId, insertUsersRoles, deleteUsersRolesByUserIdAndRoleId } = usersRoles;
const { findRolesByRoleIds } = roles;

const triggerDataHooks = jest.fn();

const tenantContext = new MockTenant(undefined, { usersRoles, users, roles }, undefined, {
  hooks: { triggerDataHooks },
});

const roleRoutes = await pickDefault(import('./role.js'));

const getDataHookContextArray = () => {
  const contextManager = triggerDataHooks.mock.calls.at(-1)?.[1] as HookContextManager | undefined;

  return contextManager?.dataHookContextArray ?? [];
};

describe('user role routes', () => {
  const roleRequester = createRequester({
    middlewares: [koaManagementApiHooks(tenantContext.libraries.hooks)],
    authedRoutes: roleRoutes,
    tenantContext,
  });

  it('GET /users/:id/roles', async () => {
    findUsersRolesByUserId.mockResolvedValueOnce([]);
    const response = await roleRequester.get(`/users/${mockUser.id}/roles`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockAdminUserRole]);
  });

  describe('POST /users/:id/roles', () => {
    it('Succeed', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([]);
      findRolesByRoleIds.mockResolvedValueOnce([mockAdminUserRole]);
      const response = await roleRequester.post(`/users/${mockUser.id}/roles`).send({
        roleIds: [mockAdminUserRole.id],
      });
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        roleIds: [mockAdminUserRole.id],
        addedRoleIds: [mockAdminUserRole.id],
      });
      expect(insertUsersRoles).toHaveBeenCalledWith([
        { id: mockId, userId: mockUser.id, roleId: mockAdminUserRole.id },
      ]);
      insertUsersRoles.mockClear();
    });

    it('Can not assign machine to machine roles to user', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([]);
      findRolesByRoleIds.mockResolvedValueOnce([
        { ...mockAdminUserRole, type: RoleType.MachineToMachine },
      ]);
      const response = await roleRequester.post(`/users/${mockUser.id}/roles`).send({
        roleIds: [mockAdminUserRole.id],
      });
      expect(response.status).toEqual(422);
    });
  });

  describe('PUT /users/:id/roles', () => {
    it('Succeed', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([mockUserRole]);
      findRolesByRoleIds.mockResolvedValueOnce([mockAdminUserRole2]);
      const response = await roleRequester.put(`/users/${mockUser.id}/roles`).send({
        roleIds: [mockAdminUserRole2.id],
      });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ roleIds: [mockAdminUserRole2.id] });
      expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(
        mockUser.id,
        mockUserRole.roleId
      );
      expect(insertUsersRoles).toHaveBeenCalledWith([
        { id: mockId, userId: mockUser.id, roleId: mockAdminUserRole2.id },
      ]);
      insertUsersRoles.mockClear();
      deleteUsersRolesByUserIdAndRoleId.mockClear();
    });

    it('Machine to machine roles will be filtered out', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([
        { ...mockUserRole, roleId: mockAdminUserRole3.id },
      ]);
      const response = await roleRequester.put(`/users/${mockUser.id}/roles`).send({
        roleIds: [mockAdminUserRole3.id],
      });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ roleIds: [mockAdminUserRole3.id] });
      expect(deleteUsersRolesByUserIdAndRoleId).not.toHaveBeenCalled();
      expect(insertUsersRoles).toHaveBeenCalledWith([]);
    });

    it('POST /users/:id/roles', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([]);
      const response = await roleRequester.post(`/users/${mockUser.id}/roles`).send({
        roleIds: [mockAdminUserRole.id],
      });
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        roleIds: [mockAdminUserRole.id],
        addedRoleIds: [mockAdminUserRole.id],
      });
      expect(insertUsersRoles).toHaveBeenCalledWith([
        { id: mockId, userId: mockUser.id, roleId: mockAdminUserRole.id },
      ]);
    });

    it('PUT /users/:id/roles', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([mockUserRole]);
      const response = await roleRequester.put(`/users/${mockUser.id}/roles`).send({
        roleIds: [mockAdminUserRole2.id],
      });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ roleIds: [mockAdminUserRole2.id] });
      expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(
        mockUser.id,
        mockAdminUserRole.id
      );
      expect(insertUsersRoles).toHaveBeenCalledWith([
        { id: mockId, userId: mockUser.id, roleId: mockAdminUserRole2.id },
      ]);
    });

    it('DELETE /users/:id/roles/:roleId', async () => {
      const response = await roleRequester.delete(
        `/users/${mockUser.id}/roles/${mockAdminUserRole.id}`
      );
      expect(response.status).toEqual(204);
      expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(
        mockUser.id,
        mockAdminUserRole.id
      );
    });
  });

  describe('User.Roles.Updated hook', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('POST /users/:userId/roles reports only roles that were actually added', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([mockUserRole]);
      findRolesByRoleIds.mockResolvedValueOnce([mockAdminUserRole2]);

      const response = await roleRequester
        .post(`/users/${mockUser.id}/roles`)
        .send({ roleIds: [mockUserRole.roleId, mockAdminUserRole2.id] });

      expect(response.status).toEqual(201);
      expect(getDataHookContextArray()).toContainEqual(
        expect.objectContaining({
          event: 'User.Roles.Updated',
          userId: mockUser.id,
          addedRoleIds: [mockAdminUserRole2.id],
          removedRoleIds: [],
          path: `/users/${mockUser.id}/roles`,
          method: 'POST',
          status: 201,
          matchedRoute: '/users/:userId/roles',
          params: { userId: mockUser.id },
        })
      );
    });

    it('POST /users/:userId/roles deduplicates requested role IDs', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([]);
      findRolesByRoleIds.mockResolvedValueOnce([mockAdminUserRole2]);

      const response = await roleRequester
        .post(`/users/${mockUser.id}/roles`)
        .send({ roleIds: [mockAdminUserRole2.id, mockAdminUserRole2.id] });

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        roleIds: [mockAdminUserRole2.id],
        addedRoleIds: [mockAdminUserRole2.id],
      });
      expect(insertUsersRoles).toHaveBeenCalledWith([
        { id: mockId, userId: mockUser.id, roleId: mockAdminUserRole2.id },
      ]);
      expect(getDataHookContextArray()).toContainEqual(
        expect.objectContaining({
          event: 'User.Roles.Updated',
          addedRoleIds: [mockAdminUserRole2.id],
        })
      );
    });

    it('PUT /users/:userId/roles reports both added and removed roles', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([mockUserRole]);
      findRolesByRoleIds.mockResolvedValueOnce([mockAdminUserRole2]);

      const response = await roleRequester
        .put(`/users/${mockUser.id}/roles`)
        .send({ roleIds: [mockAdminUserRole2.id] });

      expect(response.status).toEqual(200);
      expect(getDataHookContextArray()).toContainEqual(
        expect.objectContaining({
          event: 'User.Roles.Updated',
          userId: mockUser.id,
          addedRoleIds: [mockAdminUserRole2.id],
          removedRoleIds: [mockUserRole.roleId],
          method: 'PUT',
          status: 200,
          matchedRoute: '/users/:userId/roles',
        })
      );
    });

    it('PUT /users/:userId/roles does not emit when the role set is unchanged', async () => {
      findUsersRolesByUserId.mockResolvedValueOnce([mockUserRole]);

      const response = await roleRequester
        .put(`/users/${mockUser.id}/roles`)
        .send({ roleIds: [mockUserRole.roleId] });

      expect(response.status).toEqual(200);
      expect(getDataHookContextArray()).toEqual([]);
    });

    it('DELETE /users/:userId/roles/:roleId reports the removed role', async () => {
      const response = await roleRequester.delete(
        `/users/${mockUser.id}/roles/${mockUserRole.roleId}`
      );

      expect(response.status).toEqual(204);
      const event = getDataHookContextArray().find(({ event }) => event === 'User.Roles.Updated');
      expect(event).toMatchObject({
        event: 'User.Roles.Updated',
        userId: mockUser.id,
        addedRoleIds: [],
        removedRoleIds: [mockUserRole.roleId],
        method: 'DELETE',
        status: 204,
        matchedRoute: '/users/:userId/roles/:roleId',
        params: { userId: mockUser.id, roleId: mockUserRole.roleId },
      });
    });
  });
});
