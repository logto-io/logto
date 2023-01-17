import type { Role } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockRole, mockScope, mockResource } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const roles = {
  findRoles: jest.fn(async (): Promise<Role[]> => [mockRole]),
  countRoles: jest.fn(async () => ({ count: 10 })),
  insertRole: jest.fn(async (data) => ({
    ...data,
    id: mockRole.id,
  })),
  findRoleById: jest.fn(),
  updateRoleById: jest.fn(async (id, data) => ({
    ...mockRole,
    ...data,
  })),
  findRolesByRoleIds: jest.fn(),
};
const { findRoleById } = roles;

const scopes = {
  findScopeById: jest.fn(),
  findScopesByIds: jest.fn(),
  countScopesByScopeIds: jest.fn(async () => ({ count: 1 })),
  searchScopesByScopeIds: jest.fn(async () => [mockScope]),
};
const { findScopesByIds } = scopes;

const resources = {
  findResourcesByIds: jest.fn(async () => [mockResource]),
};

const rolesScopes = {
  insertRolesScopes: jest.fn(),
  findRolesScopesByRoleId: jest.fn(),
  deleteRolesScope: jest.fn(),
};
const { insertRolesScopes, findRolesScopesByRoleId } = rolesScopes;

const users = {
  findUserById: jest.fn(),
};

const roleRoutes = await pickDefault(import('./role.scope.js'));

const tenantContext = new MockTenant(undefined, {
  users,
  rolesScopes,
  resources,
  scopes,
  roles,
});

describe('role scope routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes, tenantContext });

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
    findRolesScopesByRoleId.mockResolvedValue([]);
    findScopesByIds.mockResolvedValueOnce([]);
    const response = await roleRequester.post(`/roles/${mockRole.id}/scopes`).send({
      scopeIds: [mockScope.id],
    });
    expect(response.status).toEqual(200);
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
