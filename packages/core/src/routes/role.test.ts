import type { Role } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockRole, mockScope } from '#src/__mocks__/index.js';
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
});
