import type { Role } from '@logto/schemas';

import { mockRole } from '@/__mocks__';
import { createRequester } from '@/utils/test-utils';

import roleRoutes from './role';

jest.mock('@/queries/roles', () => ({
  findAllRoles: jest.fn(async (): Promise<Role[]> => [mockRole]),
}));

describe('role routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes });

  it('GET /roles', async () => {
    const response = await roleRequester.get('/roles');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockRole]);
  });
});
