import { pickDefault } from '@logto/shared/esm';

import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const exists = jest.fn(async () => true);
const getEntities = jest.fn(async (): Promise<[number, never[]]> => [0, []]);
const insert = jest.fn();
const replace = jest.fn();
const deleteRelation = jest.fn();
const getUserScopes = jest.fn(async () => []);

const tenantContext = new MockTenant();
const { createRequester } = await import('#src/utils/test-utils.js');
const organizationRoutes = await pickDefault(import('../index.js'));

/* eslint-disable @silverhand/fp/no-mutation -- mock query methods on test tenant */
tenantContext.queries.organizations.relations.users.exists = exists;
tenantContext.queries.organizations.relations.usersRoles.getEntities = getEntities;
tenantContext.queries.organizations.relations.usersRoles.insert = insert;
tenantContext.queries.organizations.relations.usersRoles.replace = replace;
tenantContext.queries.organizations.relations.usersRoles.delete = deleteRelation;
tenantContext.queries.organizations.relations.usersRoles.getUserScopes = getUserScopes;
/* eslint-enable @silverhand/fp/no-mutation */

const organizationRequest = createRequester({ authedRoutes: organizationRoutes, tenantContext });

describe('organization user role relation routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const basePath = '/organizations/org-id/users/user-id/roles';

  it('GET should return roles when user is a member', async () => {
    const response = await organizationRequest.get(basePath);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([]);
    expect(exists).toHaveBeenCalledWith({ organizationId: 'org-id', userId: 'user-id' });
    expect(getEntities).toHaveBeenCalledTimes(1);
  });

  it('GET should return 422 when user is not a member', async () => {
    exists.mockResolvedValueOnce(false);

    const response = await organizationRequest.get(basePath);

    expect(response.status).toEqual(422);
    expect(getEntities).not.toHaveBeenCalled();
  });

  it('POST should reject invalid body before membership lookup', async () => {
    const response = await organizationRequest.post(basePath).send({ organizationRoleIds: [''] });

    expect(response.status).toEqual(400);
    expect(exists).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('POST should check membership and insert roles', async () => {
    const response = await organizationRequest
      .post(basePath)
      .send({ organizationRoleIds: ['role-1'] });

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({ organizationRoleIds: ['role-1'] });
    expect(exists).toHaveBeenCalledWith({ organizationId: 'org-id', userId: 'user-id' });
    expect(insert).toHaveBeenCalledWith({
      organizationId: 'org-id',
      organizationRoleId: 'role-1',
      userId: 'user-id',
    });
  });

  it('PUT should check membership and replace roles', async () => {
    const response = await organizationRequest
      .put(basePath)
      .send({ organizationRoleIds: ['role-1'] });

    expect(response.status).toEqual(204);
    expect(exists).toHaveBeenCalledWith({ organizationId: 'org-id', userId: 'user-id' });
    expect(replace).toHaveBeenCalledWith('org-id', 'user-id', ['role-1']);
  });

  it('DELETE should check membership and delete role', async () => {
    const response = await organizationRequest.delete(`${basePath}/role-1`);

    expect(response.status).toEqual(204);
    expect(exists).toHaveBeenCalledWith({ organizationId: 'org-id', userId: 'user-id' });
    expect(deleteRelation).toHaveBeenCalledWith({
      organizationId: 'org-id',
      organizationRoleId: 'role-1',
      userId: 'user-id',
    });
  });

  it('GET /scopes should not require membership lookup via users.exists', async () => {
    const response = await organizationRequest.get('/organizations/org-id/users/user-id/scopes');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([]);
    expect(exists).not.toHaveBeenCalled();
    expect(getUserScopes).toHaveBeenCalledWith('org-id', 'user-id');
  });
});
