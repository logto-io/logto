import { RoleType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockAdminUserRole,
  mockUser,
  mockAdminUserRole2,
  mockAdminUserRole3,
  mockUserRole,
} from '#src/__mocks__/index.js';
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

const tenantContext = new MockTenant(undefined, { usersRoles, users, roles });

const roleRoutes = await pickDefault(import('./role.js'));

describe('user role routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes, tenantContext });

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
});
