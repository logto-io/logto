import type { UserWithOrganizationRoles } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockUserResponse } from '#src/__mocks__/user.js';
import { type HookContextManager } from '#src/libraries/hook/context-manager.js';
import { koaManagementApiHooks } from '#src/middleware/koa-management-api-hooks.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const users: UserWithOrganizationRoles[] = [
  { ...mockUserResponse, organizationRoles: [{ id: 'organization-role-id', name: 'Member' }] },
];
const getUsersByOrganizationId = jest.fn(
  async (): Promise<[number, UserWithOrganizationRoles[]]> => [4, users]
);

const triggerDataHooks = jest.fn();
const insertWithResult = jest.fn();
const replaceWithDelta = jest.fn();
const deleteUserRole = jest.fn();
const organizationMembershipExists = jest.fn(async () => true);
const tenantContext = new MockTenant(undefined, undefined, undefined, {
  hooks: { triggerDataHooks },
});
const { createRequester } = await import('#src/utils/test-utils.js');
const organizationRoutes = await pickDefault(import('../index.js'));

// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.queries.organizations.relations.users.getUsersByOrganizationId =
  getUsersByOrganizationId;
// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.queries.organizations.relations.users.exists = organizationMembershipExists;
// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.queries.organizations.relations.usersRoles.insertWithResult = insertWithResult;
// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.queries.organizations.relations.usersRoles.replaceWithDelta = replaceWithDelta;
// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.queries.organizations.relations.usersRoles.delete = deleteUserRole;

const organizationRequest = createRequester({
  middlewares: [koaManagementApiHooks(tenantContext.libraries.hooks)],
  authedRoutes: organizationRoutes,
  tenantContext,
});

const getDataHookContextArray = () => {
  const contextManager = triggerDataHooks.mock.calls.at(-1)?.[1] as HookContextManager | undefined;

  return contextManager?.dataHookContextArray ?? [];
};

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

describe('organization user role hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /organizations/:id/users/:userId/roles emits only actually added roles', async () => {
    insertWithResult.mockResolvedValueOnce([
      {
        organizationId: 'organization-id',
        userId: 'user-id',
        organizationRoleId: 'role-id',
      },
    ]);

    const response = await organizationRequest
      .post('/organizations/organization-id/users/user-id/roles')
      .send({ organizationRoleIds: ['role-id'] });

    expect(response.status).toEqual(201);
    expect(getDataHookContextArray()).toContainEqual(
      expect.objectContaining({
        event: 'Organization.UserRoles.Updated',
        organizationId: 'organization-id',
        userId: 'user-id',
        addedOrganizationRoleIds: ['role-id'],
        removedOrganizationRoleIds: [],
        method: 'POST',
        status: 201,
        matchedRoute: '/organizations/:id/users/:userId/roles',
      })
    );
  });

  it('PUT /organizations/:id/users/:userId/roles emits both added and removed roles', async () => {
    replaceWithDelta.mockResolvedValueOnce({
      added: ['role-new'],
      removed: ['role-old'],
    });

    const response = await organizationRequest
      .put('/organizations/organization-id/users/user-id/roles')
      .send({ organizationRoleIds: ['role-new'] });

    expect(response.status).toEqual(204);
    expect(getDataHookContextArray()).toContainEqual(
      expect.objectContaining({
        event: 'Organization.UserRoles.Updated',
        organizationId: 'organization-id',
        userId: 'user-id',
        addedOrganizationRoleIds: ['role-new'],
        removedOrganizationRoleIds: ['role-old'],
        method: 'PUT',
        status: 204,
        matchedRoute: '/organizations/:id/users/:userId/roles',
      })
    );
  });

  it('PUT /organizations/:id/users/:userId/roles emits nothing when the set is unchanged', async () => {
    replaceWithDelta.mockResolvedValueOnce({ added: [], removed: [] });

    const response = await organizationRequest
      .put('/organizations/organization-id/users/user-id/roles')
      .send({ organizationRoleIds: ['role-id'] });

    expect(response.status).toEqual(204);
    expect(getDataHookContextArray()).toEqual([]);
  });

  it('DELETE /organizations/:id/users/:userId/roles/:organizationRoleId reports the removed role', async () => {
    deleteUserRole.mockResolvedValueOnce(undefined as never);

    const response = await organizationRequest.delete(
      '/organizations/organization-id/users/user-id/roles/role-id'
    );

    expect(response.status).toEqual(204);
    expect(getDataHookContextArray()).toContainEqual(
      expect.objectContaining({
        event: 'Organization.UserRoles.Updated',
        organizationId: 'organization-id',
        userId: 'user-id',
        addedOrganizationRoleIds: [],
        removedOrganizationRoleIds: ['role-id'],
        method: 'DELETE',
        status: 204,
        matchedRoute: '/organizations/:id/users/:userId/roles/:organizationRoleId',
      })
    );
  });

  it('POST /organizations/:id/users/roles emits one event per user', async () => {
    insertWithResult.mockResolvedValueOnce([
      {
        organizationId: 'organization-id',
        userId: 'user-1',
        organizationRoleId: 'role-id',
      },
      {
        organizationId: 'organization-id',
        userId: 'user-2',
        organizationRoleId: 'role-id',
      },
    ]);

    const response = await organizationRequest
      .post('/organizations/organization-id/users/roles')
      .send({
        userIds: ['user-1', 'user-2'],
        organizationRoleIds: ['role-id'],
      });

    expect(response.status).toEqual(201);
    const userRoleEvents = getDataHookContextArray().filter(
      ({ event }) => event === 'Organization.UserRoles.Updated'
    );
    expect(userRoleEvents).toHaveLength(2);
    expect(userRoleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: 'user-1', addedOrganizationRoleIds: ['role-id'] }),
        expect.objectContaining({ userId: 'user-2', addedOrganizationRoleIds: ['role-id'] }),
      ])
    );
  });
});
