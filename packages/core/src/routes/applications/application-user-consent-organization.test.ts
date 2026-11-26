import { pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const validateThirdPartyApplicationById = jest.fn();
const validateUserConsentOrganizationMembership = jest.fn();
const findUserById = jest.fn();
const getEntities = jest.fn(async (): Promise<[number, never[]]> => [0, []]);
const replace = jest.fn();
const insert = jest.fn();
const deleteRelation = jest.fn();

const tenantContext = new MockTenant(
  undefined,
  {
    users: { findUserById },
  },
  undefined,
  {
    applications: {
      validateThirdPartyApplicationById,
      validateUserConsentOrganizationMembership,
    },
  }
);

/* eslint-disable @silverhand/fp/no-mutation -- mock query methods on test tenant */
tenantContext.queries.applications.userConsentOrganizations.getEntities = getEntities;
tenantContext.queries.applications.userConsentOrganizations.replace = replace;
tenantContext.queries.applications.userConsentOrganizations.insert = insert;
tenantContext.queries.applications.userConsentOrganizations.delete = deleteRelation;
/* eslint-enable @silverhand/fp/no-mutation */

const { createRequester } = await import('#src/utils/test-utils.js');
const applicationUserConsentOrganizationRoutes = await pickDefault(
  import('./application-user-consent-organization.js')
);

describe('application user consent organization routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const requester = createRequester({
    authedRoutes: applicationUserConsentOrganizationRoutes,
    tenantContext,
  });

  const basePath = '/applications/app-id/users/user-id/consent-organizations';

  it('GET should validate application and user before fetching organizations', async () => {
    const response = await requester.get(basePath);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ organizations: [] });
    expect(validateThirdPartyApplicationById).toHaveBeenCalledWith('app-id');
    expect(findUserById).toHaveBeenCalledWith('user-id');
    expect(getEntities).toHaveBeenCalledTimes(1);
  });

  it('GET should propagate validation errors', async () => {
    validateThirdPartyApplicationById.mockRejectedValueOnce(
      new RequestError({ code: 'application.third_party_application_only', status: 422 })
    );

    const response = await requester.get(basePath);

    expect(response.status).toEqual(422);
    expect(findUserById).not.toHaveBeenCalled();
    expect(getEntities).not.toHaveBeenCalled();
  });

  it('POST should reject invalid body before DB lookups', async () => {
    const response = await requester.post(basePath).send({ organizationIds: [] });

    expect(response.status).toEqual(400);
    expect(validateThirdPartyApplicationById).not.toHaveBeenCalled();
    expect(findUserById).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('POST should validate application and user and insert organizations', async () => {
    const response = await requester.post(basePath).send({ organizationIds: ['org-1'] });

    expect(response.status).toEqual(201);
    expect(validateThirdPartyApplicationById).toHaveBeenCalledWith('app-id');
    expect(findUserById).toHaveBeenCalledWith('user-id');
    expect(validateUserConsentOrganizationMembership).toHaveBeenCalledWith('user-id', ['org-1']);
    expect(insert).toHaveBeenCalledWith({
      applicationId: 'app-id',
      userId: 'user-id',
      organizationId: 'org-1',
    });
  });

  it('PUT should validate application and user and replace organizations', async () => {
    const response = await requester.put(basePath).send({ organizationIds: ['org-1'] });

    expect(response.status).toEqual(204);
    expect(validateThirdPartyApplicationById).toHaveBeenCalledWith('app-id');
    expect(findUserById).toHaveBeenCalledWith('user-id');
    expect(validateUserConsentOrganizationMembership).toHaveBeenCalledWith('user-id', ['org-1']);
    expect(replace).toHaveBeenCalledWith('app-id', 'user-id', ['org-1']);
  });

  it('DELETE should validate application and user and delete organization', async () => {
    const response = await requester.delete(`${basePath}/org-1`);

    expect(response.status).toEqual(204);
    expect(validateThirdPartyApplicationById).toHaveBeenCalledWith('app-id');
    expect(findUserById).toHaveBeenCalledWith('user-id');
    expect(deleteRelation).toHaveBeenCalledWith({
      applicationId: 'app-id',
      organizationId: 'org-1',
      userId: 'user-id',
    });
  });
});
