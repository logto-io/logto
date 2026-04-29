import type { Role } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockAdminUserRole, mockScope, mockUser } from '#src/__mocks__/index.js';
import { mockIdGenerators } from '#src/test-utils/nanoid.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockIdGenerators();

const roles = {
  findRoles: jest.fn(async (): Promise<Role[]> => [mockAdminUserRole]),
  countRoles: jest.fn(async () => ({ count: 10 })),
  // eslint-disable-next-line @typescript-eslint/ban-types
  findRoleByRoleName: jest.fn(async (): Promise<Role | null> => null),
  insertRole: jest.fn(async (data) => ({
    type: mockAdminUserRole.type,
    isDefault: false,
    ...data,
    id: mockAdminUserRole.id,
    tenantId: 'fake_tenant',
  })),
  deleteRoleById: jest.fn(),
  findRoleById: jest.fn(),
  updateRoleById: jest.fn(async (id, data) => ({
    ...mockAdminUserRole,
    ...data,
    tenantId: 'fake_tenant',
  })),
};
const { findRoleByRoleName, findRoleById, deleteRoleById } = roles;

const scopes = {
  findScopeById: jest.fn(),
};

const rolesScopes = {
  insertRolesScopes: jest.fn(),
};
const { insertRolesScopes } = rolesScopes;

const users = {
  findUsersByIds: jest.fn(),
};
const { findUsersByIds } = users;

const usersRoles = {
  countUsersRolesByRoleIds: jest.fn(),
  findUsersRolesByRoleIds: jest.fn(),
  findUsersRolesByUserId: jest.fn(async () => []),
  deleteUsersRolesByUserIdAndRoleId: jest.fn(),
};
const { findUsersRolesByRoleIds, countUsersRolesByRoleIds } = usersRoles;

const applications = { findApplicationsByIds: jest.fn() };
const { findApplicationsByIds } = applications;

const applicationsRoles = {
  countApplicationsRolesByRoleIds: jest.fn(),
  findApplicationsRolesByRoleIds: jest.fn(),
  findApplicationsRolesByApplicationId: jest.fn(async () => []),
};
const { countApplicationsRolesByRoleIds, findApplicationsRolesByRoleIds } = applicationsRoles;

const rolesScopesLibrary = {
  validateRoleScopeAssignment: jest.fn(),
};
const { validateRoleScopeAssignment } = rolesScopesLibrary;

const roleRoutes = await pickDefault(import('./role.js'));

const tenantContext = new MockTenant(
  undefined,
  {
    usersRoles,
    users,
    rolesScopes,
    scopes,
    roles,
    applicationsRoles,
    applications,
  },
  undefined,
  { quota: createMockQuotaLibrary(), roleScopes: rolesScopesLibrary }
);

describe('role routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes, tenantContext });

  it('GET /roles', async () => {
    countUsersRolesByRoleIds.mockResolvedValueOnce([{ roleId: mockAdminUserRole.id, count: 1 }]);
    findUsersRolesByRoleIds.mockResolvedValueOnce([
      { roleId: mockAdminUserRole.id, userId: mockUser.id },
    ]);
    findUsersByIds.mockResolvedValueOnce([mockUser]);
    countApplicationsRolesByRoleIds.mockResolvedValueOnce([]);
    findApplicationsRolesByRoleIds.mockResolvedValueOnce([]);
    findApplicationsByIds.mockResolvedValueOnce([]);
    const response = await roleRequester.get('/roles');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      {
        ...mockAdminUserRole,
        usersCount: 1,
        featuredUsers: [
          {
            id: mockUser.id,
            avatar: mockUser.avatar,
            name: mockUser.name,
          },
        ],
        applicationsCount: 0,
        featuredApplications: [],
      },
    ]);
  });

  it('POST /roles', async () => {
    const { name, description } = mockAdminUserRole;

    const response = await roleRequester.post('/roles').send({ name, description });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockAdminUserRole);
    expect(findRoleByRoleName).toHaveBeenCalled();
  });

  it('POST /roles with scopeIds', async () => {
    const { name, description } = mockAdminUserRole;

    const response = await roleRequester
      .post('/roles')
      .send({ name, description, scopeIds: [mockScope.id] });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockAdminUserRole);
    expect(findRoleByRoleName).toHaveBeenCalled();
    expect(validateRoleScopeAssignment).toHaveBeenCalledWith([mockScope.id], response.body.id, {
      skipScopeExistenceCheck: true,
    });
    expect(insertRolesScopes).toHaveBeenCalled();
  });

  it('GET /roles/:id', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    const response = await roleRequester.get(`/roles/${mockAdminUserRole.id}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockAdminUserRole);
  });

  describe('PATCH /roles/:id', () => {
    it('updated successfully', async () => {
      findRoleById.mockResolvedValueOnce(mockAdminUserRole);
      const response = await roleRequester
        .patch(`/roles/${mockAdminUserRole.id}`)
        .send({ description: 'new' });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...mockAdminUserRole,
        description: 'new',
      });
    });

    it('name conflict', async () => {
      findRoleById.mockResolvedValueOnce(mockAdminUserRole);
      findRoleByRoleName.mockResolvedValueOnce(mockAdminUserRole);
      const response = await roleRequester
        .patch(`/roles/${mockAdminUserRole.id}`)
        .send({ name: mockAdminUserRole.name });
      expect(response.status).toEqual(422);
    });
  });

  it('DELETE /roles/:id', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    const response = await roleRequester.delete(`/roles/${mockAdminUserRole.id}`);
    expect(response.status).toEqual(204);
    expect(deleteRoleById).toHaveBeenCalledWith(mockAdminUserRole.id);
  });
});
