import type { Role } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockRole, mockScope, mockUser } from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

const { findRoleByRoleName, findRoleById, deleteRoleById } = mockEsm(
  '#src/queries/roles.js',
  () => ({
    findAllRoles: jest.fn(async (): Promise<Role[]> => [mockRole]),
    findRoleByRoleName: jest.fn(async (): Promise<Role | undefined> => undefined),
    insertRole: jest.fn(async (data) => ({
      ...data,
      id: mockRole.id,
    })),
    deleteRoleById: jest.fn(),
    findRoleById: jest.fn(),
    updateRoleById: jest.fn(async (id, data) => ({
      ...mockRole,
      ...data,
    })),
    findRolesByRoleIds: jest.fn(),
  })
);
const { findScopeById, findScopesByIds } = await mockEsmWithActual('#src/queries/scope.js', () => ({
  findScopeById: jest.fn(),
  findScopesByIds: jest.fn(),
}));
const { insertRolesScopes, findRolesScopesByRoleId } = await mockEsmWithActual(
  '#src/queries/roles-scopes.js',
  () => ({
    insertRolesScopes: jest.fn(),
    findRolesScopesByRoleId: jest.fn(),
    deleteRolesScope: jest.fn(),
  })
);
const { findUsersByIds } = await mockEsmWithActual('#src/queries/user.js', () => ({
  findUsersByIds: jest.fn(),
  findUserById: jest.fn(),
}));
const {
  insertUsersRoles,
  findUsersRolesByRoleId,
  deleteUsersRolesByUserIdAndRoleId,
  findFirstUsersRolesByRoleIdAndUserIds,
} = await mockEsmWithActual('#src/queries/users-roles.js', () => ({
  insertUsersRoles: jest.fn(),
  findUsersRolesByRoleId: jest.fn(),
  findFirstUsersRolesByRoleIdAndUserIds: jest.fn(),
  deleteUsersRolesByUserIdAndRoleId: jest.fn(),
}));
const roleRoutes = await pickDefault(import('./role.js'));

describe('role routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes });

  it('GET /roles', async () => {
    const response = await roleRequester.get('/roles');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockRole]);
  });

  it('POST /roles', async () => {
    const { name, description } = mockRole;

    const response = await roleRequester.post('/roles').send({ name, description });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockRole);
    expect(findRoleByRoleName).toHaveBeenCalled();
  });

  it('POST /roles with scopeIds', async () => {
    const { name, description } = mockRole;

    const response = await roleRequester
      .post('/roles')
      .send({ name, description, scopeIds: [mockScope.id] });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockRole);
    expect(findRoleByRoleName).toHaveBeenCalled();
    expect(findScopeById).toHaveBeenCalledWith(mockScope.id);
    expect(insertRolesScopes).toHaveBeenCalled();
  });

  it('GET /roles/:id', async () => {
    findRoleById.mockResolvedValueOnce(mockRole);
    const response = await roleRequester.get(`/roles/${mockRole.id}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockRole);
  });

  describe('PATCH /roles/:id', () => {
    it('updated successfully', async () => {
      findRoleById.mockResolvedValueOnce(mockRole);
      const response = await roleRequester
        .patch(`/roles/${mockRole.id}`)
        .send({ description: 'new' });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...mockRole,
        description: 'new',
      });
    });

    it('name conflict', async () => {
      findRoleById.mockResolvedValueOnce(mockRole);
      findRoleByRoleName.mockResolvedValueOnce(mockRole);
      const response = await roleRequester
        .patch(`/roles/${mockRole.id}`)
        .send({ name: mockRole.name });
      expect(response.status).toEqual(400);
    });
  });

  it('DELETE /roles/:id', async () => {
    const response = await roleRequester.delete(`/roles/${mockRole.id}`);
    expect(response.status).toEqual(204);
    expect(deleteRoleById).toHaveBeenCalledWith(mockRole.id);
  });

  it('GET /roles/:id/scopes', async () => {
    findRoleById.mockResolvedValueOnce(mockRole);
    findRolesScopesByRoleId.mockResolvedValueOnce([]);
    findScopesByIds.mockResolvedValueOnce([mockScope]);
    const response = await roleRequester.get(`/roles/${mockRole.id}/scopes`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockScope]);
  });

  it('POST /roles/:id/scopes', async () => {
    findRoleById.mockResolvedValueOnce(mockRole);
    findRolesScopesByRoleId.mockResolvedValueOnce([]);
    const response = await roleRequester.post(`/roles/${mockRole.id}/scopes`).send({
      scopeIds: [mockScope.id],
    });
    expect(response.status).toEqual(201);
    expect(insertRolesScopes).toHaveBeenCalledWith([
      { roleId: mockRole.id, scopeId: mockScope.id },
    ]);
  });

  it('DELETE /roles/:id/scopes/:scopeId', async () => {
    findRoleById.mockResolvedValueOnce(mockRole);
    findRolesScopesByRoleId.mockResolvedValueOnce([]);
    const response = await roleRequester.delete(`/roles/${mockRole.id}/scopes/${mockScope.id}`);
    expect(response.status).toEqual(204);
  });

  it('GET /roles/:id/users', async () => {
    findRoleById.mockResolvedValueOnce(mockRole);
    findUsersRolesByRoleId.mockResolvedValueOnce([]);
    findUsersByIds.mockResolvedValueOnce([mockUser]);
    const response = await roleRequester.get(`/roles/${mockRole.id}/users`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockUser]);
  });

  it('POST /roles/:id/users', async () => {
    findRoleById.mockResolvedValueOnce(mockRole);
    findFirstUsersRolesByRoleIdAndUserIds.mockResolvedValueOnce(null);
    const response = await roleRequester.post(`/roles/${mockRole.id}/users`).send({
      userIds: [mockUser.id],
    });
    expect(response.status).toEqual(201);
    expect(insertUsersRoles).toHaveBeenCalledWith([{ userId: mockUser.id, roleId: mockRole.id }]);
  });

  it('DELETE /roles/:id/users/:userId', async () => {
    const response = await roleRequester.delete(`/roles/${mockRole.id}/users/${mockUser.id}`);
    expect(response.status).toEqual(204);
    expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
  });
});
