import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockRole, mockUser } from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('#src/queries/user.js', () => ({
  findUserById: jest.fn(),
}));
const { findRolesByRoleIds } = await mockEsmWithActual('#src/queries/roles.js', () => ({
  findRolesByRoleIds: jest.fn(),
  findRoleById: jest.fn(),
}));
const { findUsersRolesByUserId, insertUsersRoles, deleteUsersRolesByUserIdAndRoleId } =
  await mockEsmWithActual('#src/queries/users-roles.js', () => ({
    findUsersRolesByUserId: jest.fn(),
    insertUsersRoles: jest.fn(),
    deleteUsersRolesByUserIdAndRoleId: jest.fn(),
  }));
const roleRoutes = await pickDefault(import('./admin-user-role.js'));

describe('user role routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes });

  it('GET /users/:id/roles', async () => {
    findUsersRolesByUserId.mockResolvedValueOnce([]);
    findRolesByRoleIds.mockResolvedValueOnce([mockRole]);
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
    expect(insertUsersRoles).toHaveBeenCalledWith([{ userId: mockUser.id, roleId: mockRole.id }]);
  });

  it('DELETE /users/:id/roles/:roleId', async () => {
    const response = await roleRequester.delete(`/users/${mockUser.id}/roles/${mockRole.id}`);
    expect(response.status).toEqual(204);
    expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
  });
});
