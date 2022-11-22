import type { Role } from '@logto/schemas';

import { mockRole } from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

import roleRoutes from './role.js';

jest.mock('#src/queries/roles.js', () => ({
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
