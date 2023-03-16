import type { Role } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockRole, mockScope, mockUser, mockResource } from '#src/__mocks__/index.js';
import { mockId, mockStandardId } from '#src/test-utils/nanoid.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockStandardId();

const roles = {
  findRoles: jest.fn(async (): Promise<Role[]> => [mockRole]),
  countRoles: jest.fn(async () => ({ count: 10 })),
  // eslint-disable-next-line @typescript-eslint/ban-types
  findRoleByRoleName: jest.fn(async (): Promise<Role | null> => null),
  insertRole: jest.fn(async (data) => ({
    ...data,
    id: mockRole.id,
    tenantId: 'fake_tenant',
  })),
  deleteRoleById: jest.fn(),
  findRoleById: jest.fn(),
  updateRoleById: jest.fn(async (id, data) => ({
    ...mockRole,
    ...data,
    tenantId: 'fake_tenant',
  })),
  findRolesByRoleIds: jest.fn(),
};
const { findRoleByRoleName, findRoleById, deleteRoleById } = roles;

const scopes = {
  findScopeById: jest.fn(),
};
const { findScopeById } = scopes;

const resources = {
  findResourcesByIds: jest.fn(async () => [mockResource]),
};

const rolesScopes = {
  insertRolesScopes: jest.fn(),
  deleteRolesScope: jest.fn(),
};
const { insertRolesScopes } = rolesScopes;

const users = {
  findUsersByIds: jest.fn(),
  findUserById: jest.fn(),
  countUsers: jest.fn(async () => ({ count: 1 })),
  findUsers: jest.fn(async () => [mockUser]),
};
const { findUsersByIds } = users;

const usersRoles = {
  insertUsersRoles: jest.fn(),
  countUsersRolesByRoleId: jest.fn(),
  findUsersRolesByRoleId: jest.fn(),
  findFirstUsersRolesByRoleIdAndUserIds: jest.fn(),
  deleteUsersRolesByUserIdAndRoleId: jest.fn(),
};
const {
  insertUsersRoles,
  findUsersRolesByRoleId,
  deleteUsersRolesByUserIdAndRoleId,
  findFirstUsersRolesByRoleIdAndUserIds,
  countUsersRolesByRoleId,
} = usersRoles;

const roleRoutes = await pickDefault(import('./role.js'));

const tenantContext = new MockTenant(undefined, {
  usersRoles,
  users,
  rolesScopes,
  resources,
  scopes,
  roles,
});

describe('role routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes, tenantContext });

  it('GET /roles', async () => {
    countUsersRolesByRoleId.mockResolvedValueOnce({ count: 1 });
    findUsersByIds.mockResolvedValueOnce([mockUser]);
    findUsersRolesByRoleId.mockResolvedValueOnce([]);
    const response = await roleRequester.get('/roles');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      {
        ...mockRole,
        usersCount: 1,
        featuredUsers: [
          {
            id: mockUser.id,
            avatar: mockUser.avatar,
            name: mockUser.name,
          },
        ],
      },
    ]);
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
      expect(response.status).toEqual(422);
    });
  });

  it('DELETE /roles/:id', async () => {
    const response = await roleRequester.delete(`/roles/${mockRole.id}`);
    expect(response.status).toEqual(204);
    expect(deleteRoleById).toHaveBeenCalledWith(mockRole.id);
  });

  it('GET /roles/:id/users', async () => {
    findRoleById.mockResolvedValueOnce(mockRole);
    findUsersRolesByRoleId.mockResolvedValueOnce([]);
    findUsersByIds.mockResolvedValueOnce([mockUser]);
    const response = await roleRequester.get(`/roles/${mockRole.id}/users`);
    expect(response.status).toEqual(200);
    expect(response.body[0]).toHaveProperty('id', mockUser.id);
  });

  it('POST /roles/:id/users', async () => {
    findRoleById.mockResolvedValueOnce(mockRole);
    findFirstUsersRolesByRoleIdAndUserIds.mockResolvedValueOnce(null);
    const response = await roleRequester.post(`/roles/${mockRole.id}/users`).send({
      userIds: [mockUser.id],
    });
    expect(response.status).toEqual(201);
    expect(insertUsersRoles).toHaveBeenCalledWith([
      { id: mockId, userId: mockUser.id, roleId: mockRole.id },
    ]);
  });

  it('DELETE /roles/:id/users/:userId', async () => {
    const response = await roleRequester.delete(`/roles/${mockRole.id}/users/${mockUser.id}`);
    expect(response.status).toEqual(204);
    expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
  });
});
