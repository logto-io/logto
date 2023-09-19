import { pickDefault } from '@logto/shared/esm';

import { mockAdminUserRole, mockUser } from '#src/__mocks__/index.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockIdGenerators();

const roles = {
  findRoleById: jest.fn(),
};
const { findRoleById } = roles;

const users = {
  findUserById: jest.fn(),
  countUsers: jest.fn(async () => ({ count: 1 })),
  findUsers: jest.fn(async () => [mockUser]),
};

const usersRoles = {
  insertUsersRoles: jest.fn(),
  findUsersRolesByRoleId: jest.fn(),
  findFirstUsersRolesByRoleIdAndUserIds: jest.fn(),
  deleteUsersRolesByUserIdAndRoleId: jest.fn(),
};
const {
  insertUsersRoles,
  findUsersRolesByRoleId,
  deleteUsersRolesByUserIdAndRoleId,
  findFirstUsersRolesByRoleIdAndUserIds,
} = usersRoles;

const roleUserRoutes = await pickDefault(import('./role.user.js'));

const tenantContext = new MockTenant(
  undefined,
  {
    usersRoles,
    users,
    roles,
  },
  undefined,
  { quota: createMockQuotaLibrary() }
);

describe('role user routes', () => {
  const roleUserRequester = createRequester({ authedRoutes: roleUserRoutes, tenantContext });

  it('GET /roles/:id/users', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    findUsersRolesByRoleId.mockResolvedValueOnce([]);
    const response = await roleUserRequester.get(`/roles/${mockAdminUserRole.id}/users`);
    expect(response.status).toEqual(200);
    expect(response.body[0]).toHaveProperty('id', mockUser.id);
  });

  it('POST /roles/:id/users', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminUserRole);
    findFirstUsersRolesByRoleIdAndUserIds.mockResolvedValueOnce(null);
    const response = await roleUserRequester.post(`/roles/${mockAdminUserRole.id}/users`).send({
      userIds: [mockUser.id],
    });
    expect(response.status).toEqual(201);
    expect(insertUsersRoles).toHaveBeenCalledWith([
      { id: mockId, userId: mockUser.id, roleId: mockAdminUserRole.id },
    ]);
  });

  it('DELETE /roles/:id/users/:userId', async () => {
    const response = await roleUserRequester.delete(
      `/roles/${mockAdminUserRole.id}/users/${mockUser.id}`
    );
    expect(response.status).toEqual(204);
    expect(deleteUsersRolesByUserIdAndRoleId).toHaveBeenCalledWith(
      mockUser.id,
      mockAdminUserRole.id
    );
  });
});
