import type { Role } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockRole } from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

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
});
