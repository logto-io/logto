import type { Role } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockAdminUserRole,
  mockResource,
  mockScope,
  mockScopeWithResource,
} from '#src/__mocks__/index.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockIdGenerators();

const roles = {
  findRoles: jest.fn(async (): Promise<Role[]> => [mockAdminUserRole]),
  countRoles: jest.fn(async () => ({ count: 10 })),
  insertRole: jest.fn(async (data) => ({
    ...data,
    id: mockAdminUserRole.id,
  })),
  findRoleById: jest.fn(),
  updateRoleById: jest.fn(async (id, data) => ({
    ...mockAdminUserRole,
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

const rolesScopesLibrary = {
  validateRoleScopeAssignment: jest.fn(),
};
const { validateRoleScopeAssignment } = rolesScopesLibrary;

const roleRoutes = await pickDefault(import('./role.scope.js'));

const tenantContext = new MockTenant(
  undefined,
  {
    users,
    rolesScopes,
    resources,
    scopes,
    roles,
  },
  undefined,
  {
    quota: createMockQuotaLibrary(),
    roleScopes: rolesScopesLibrary,
  }
);

describe('role scope routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes, tenantContext });

  it('GET /roles/:id/scopes', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    findRolesScopesByRoleId.mockResolvedValueOnce([]);
    findScopesByIds.mockResolvedValueOnce([mockScope]);
    const response = await roleRequester.get(`/roles/${mockAdminUserRole.id}/scopes`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockScopeWithResource]);
  });

  it('GET /roles/:id/scopes (with pagination)', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    findRolesScopesByRoleId.mockResolvedValueOnce([]);
    findScopesByIds.mockResolvedValueOnce([mockScope]);
    const response = await roleRequester.get(`/roles/${mockAdminUserRole.id}/scopes?page=1`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockScopeWithResource]);
  });

  it('POST /roles/:id/scopes', async () => {
    findRolesScopesByRoleId.mockResolvedValue([]);
    findScopesByIds.mockResolvedValueOnce([]);
    const response = await roleRequester.post(`/roles/${mockAdminUserRole.id}/scopes`).send({
      scopeIds: [mockScope.id],
    });
    expect(response.status).toEqual(201);
    expect(validateRoleScopeAssignment).toHaveBeenCalledWith([mockScope.id], mockAdminUserRole.id);
    expect(insertRolesScopes).toHaveBeenCalledWith([
      { id: mockId, roleId: mockAdminUserRole.id, scopeId: mockScope.id },
    ]);
  });

  it('DELETE /roles/:id/scopes/:scopeId', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    findRolesScopesByRoleId.mockResolvedValueOnce([]);
    const response = await roleRequester.delete(
      `/roles/${mockAdminUserRole.id}/scopes/${mockScope.id}`
    );
    expect(response.status).toEqual(204);
  });
});
