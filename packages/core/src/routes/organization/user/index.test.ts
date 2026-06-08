import type { UserWithOrganizationRoles } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockUserResponse } from '#src/__mocks__/user.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const users: UserWithOrganizationRoles[] = [
  { ...mockUserResponse, organizationRoles: [{ id: 'organization-role-id', name: 'Member' }] },
];
const getUsersByOrganizationId = jest.fn(
  async (): Promise<[number, UserWithOrganizationRoles[]]> => [4, users]
);

const tenantContext = new MockTenant();
const { createRequester } = await import('#src/utils/test-utils.js');
const organizationRoutes = await pickDefault(import('../index.js'));

// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.queries.organizations.relations.users.getUsersByOrganizationId =
  getUsersByOrganizationId;

const organizationRequest = createRequester({ authedRoutes: organizationRoutes, tenantContext });

describe('organization user routes', () => {
  afterEach(() => {
    getUsersByOrganizationId.mockClear();
  });

  it('GET /organizations/:id/users should return paginated organization users', async () => {
    const response = await organizationRequest
      .get('/organizations/organization-id/users')
      .query({ page: '1', page_size: '3' });

    expect(response.status).toEqual(200);
    expect(response.header['total-number']).toEqual('4');
    expect(getUsersByOrganizationId).toHaveBeenCalledWith(
      'organization-id',
      expect.objectContaining({ limit: 3, offset: 0, disabled: false }),
      undefined,
      {}
    );
    expect(response.body).toMatchObject([
      { id: mockUserResponse.id, organizationRoles: [{ id: 'organization-role-id' }] },
    ]);
  });

  it('GET /organizations/:id/users should filter by organization role', async () => {
    const response = await organizationRequest
      .get('/organizations/organization-id/users')
      .query({ page: '1', page_size: '3', organizationRoleId: 'organization-role-id' });

    expect(response.status).toEqual(200);
    expect(getUsersByOrganizationId).toHaveBeenCalledWith(
      'organization-id',
      expect.objectContaining({ limit: 3, offset: 0, disabled: false }),
      undefined,
      { organizationRoleId: 'organization-role-id' }
    );
  });

  it('GET /organizations/:id/users should reject empty organization role filter', async () => {
    const response = await organizationRequest
      .get('/organizations/organization-id/users')
      .query({ page: '1', page_size: '3', organizationRoleId: '' });

    expect(response.status).toEqual(400);
    expect(getUsersByOrganizationId).not.toHaveBeenCalled();
  });
});
