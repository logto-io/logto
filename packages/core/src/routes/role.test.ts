import type { Role } from '@logto/schemas';
import { mockEsm, pickDefault } from '@logto/shared/esm';

import { mockRole } from '#src/__mocks__/index.js';

const { jest } = import.meta;

mockEsm('#src/queries/roles.js', () => ({
  findAllRoles: jest.fn(async (): Promise<Role[]> => [mockRole]),
}));

const { createRequester } = await import('#src/utils/test-utils.js');
const roleRoutes = await pickDefault(import('./role.js'));

describe('role routes', () => {
  const roleRequester = createRequester({ authedRoutes: roleRoutes });

  it('GET /roles', async () => {
    const response = await roleRequester.get('/roles');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockRole]);
  });
});
