import { pickDefault } from '@logto/shared/esm';

import { mockRole, mockUser, mockRole2, mockUserRole } from '#src/__mocks__/index.js';
import { mockId, mockStandardId } from '#src/test-utils/nanoid.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockStandardId();

const users = { findUserById: jest.fn() };

const roles = {
  findRolesByRoleIds: jest.fn(),
  findRoleById: jest.fn(),
  countRoles: jest.fn(async () => ({ count: 1 })),
  findRoles: jest.fn(async () => [mockRole]),
};

const usersRoles = {
  findUsersRolesByUserId: jest.fn(),
  insertUsersRoles: jest.fn(),
  deleteUsersRolesByUserIdAndRoleId: jest.fn(),
};
const { findUsersRolesByUserId, insertUsersRoles, deleteUsersRolesByUserIdAndRoleId } = usersRoles;

const tenantContext = new MockTenant(undefined, { usersRoles, users, roles });

const roleRoutes = await pickDefault(import('./admin-user-role.js'));

describe('user role routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes, tenantContext });

  it('GET /users/:id/roles', async () => {
    findUsersRolesByUserId.mockResolvedValueOnce([]);
    const response = await roleRequester.get(`/users/${mockUser.id}/roles`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockRole]);
  });

  it('POST /users/:id/roles', async () => {
    findUsersRolesByUserId.mockResolvedValueOnce([]);
    const response = await roleRequester.post(`/users/${mockUser.id}/roles`).send({
      roleIds: [mockRole.id],
    });
    expect(response.status).toEqual(201);
    expect(insertUsersRoles).toHaveBeenCalledWith([
      { id: mockId, userId: mockUser.id, roleId: mockRole.id },
    ]);
  });

  it('PATCH /users/:id/roles', async () => {
    findUsersRolesByUserId.mockResolvedValueOnce([mockUserRole]);
    const response = await roleRequester.patch(`/users/${mockUser.id}/roles`).send({
      roleIds: [mockRole2.id],
    });
    expect(response.status).toEqual(200);
    expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
    expect(insertUsersRoles).toHaveBeenCalledWith([
      { id: mockId, userId: mockUser.id, roleId: mockRole2.id },
    ]);
  });

  it('DELETE /users/:id/roles/:roleId', async () => {
    const response = await roleRequester.delete(`/users/${mockUser.id}/roles/${mockRole.id}`);
    expect(response.status).toEqual(204);
    expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
  });
});
