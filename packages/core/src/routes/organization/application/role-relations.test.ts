import { pickDefault } from '@logto/shared/esm';

import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const exists = jest.fn(async () => true);
const getEntities = jest.fn(async (): Promise<[number, never[]]> => [0, []]);
const insert = jest.fn();
const replace = jest.fn();
const deleteRelation = jest.fn();

const tenantContext = new MockTenant();
const { createRequester } = await import('#src/utils/test-utils.js');
const organizationRoutes = await pickDefault(import('../index.js'));

/* eslint-disable @silverhand/fp/no-mutation -- mock query methods on test tenant */
tenantContext.queries.organizations.relations.apps.exists = exists;
tenantContext.queries.organizations.relations.appsRoles.getEntities = getEntities;
tenantContext.queries.organizations.relations.appsRoles.insert = insert;
tenantContext.queries.organizations.relations.appsRoles.replace = replace;
tenantContext.queries.organizations.relations.appsRoles.delete = deleteRelation;
/* eslint-enable @silverhand/fp/no-mutation */

const organizationRequest = createRequester({ authedRoutes: organizationRoutes, tenantContext });

describe('organization application role relation routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const basePath = '/organizations/org-id/applications/app-id/roles';

  it('GET should return roles when application is a member', async () => {
    const response = await organizationRequest.get(basePath);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([]);
    expect(exists).toHaveBeenCalledWith({ organizationId: 'org-id', applicationId: 'app-id' });
    expect(getEntities).toHaveBeenCalledTimes(1);
  });

  it('GET should return 422 when application is not a member', async () => {
    exists.mockResolvedValueOnce(false);

    const response = await organizationRequest.get(basePath);

    expect(response.status).toEqual(422);
    expect(getEntities).not.toHaveBeenCalled();
  });

  it('POST should reject invalid body before membership lookup', async () => {
    const response = await organizationRequest.post(basePath).send({ organizationRoleIds: [] });

    expect(response.status).toEqual(400);
    expect(exists).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('POST should check membership and insert roles', async () => {
    const response = await organizationRequest
      .post(basePath)
      .send({ organizationRoleIds: ['role-1'] });

    expect(response.status).toEqual(201);
    expect(exists).toHaveBeenCalledWith({ organizationId: 'org-id', applicationId: 'app-id' });
    expect(insert).toHaveBeenCalledWith({
      organizationId: 'org-id',
      applicationId: 'app-id',
      organizationRoleId: 'role-1',
    });
  });

  it('PUT should check membership and replace roles', async () => {
    const response = await organizationRequest
      .put(basePath)
      .send({ organizationRoleIds: ['role-1'] });

    expect(response.status).toEqual(204);
    expect(exists).toHaveBeenCalledWith({ organizationId: 'org-id', applicationId: 'app-id' });
    expect(replace).toHaveBeenCalledWith('org-id', 'app-id', ['role-1']);
  });

  it('DELETE should check membership and delete role', async () => {
    const response = await organizationRequest.delete(`${basePath}/role-1`);

    expect(response.status).toEqual(204);
    expect(exists).toHaveBeenCalledWith({ organizationId: 'org-id', applicationId: 'app-id' });
    expect(deleteRelation).toHaveBeenCalledWith({
      organizationId: 'org-id',
      applicationId: 'app-id',
      organizationRoleId: 'role-1',
    });
  });
});
