import {
  type Application,
  type CreateApplication,
  createDefaultApplicationAccessControl,
  type ApplicationAccessControl,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockApplication } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const findApplicationById = jest.fn(async () => mockApplication);
const updateApplicationById = jest.fn(
  async (_, data: Partial<CreateApplication>): Promise<Application> => ({
    ...mockApplication,
    ...data,
  })
);
const findApplicationAccessControl = jest.fn(async () => createDefaultApplicationAccessControl());
const replaceApplicationAccessControl = jest.fn();

const tenantContext = new MockTenant(undefined, {
  applications: {
    findApplicationById,
    updateApplicationById,
  },
  applicationAccessControl: {
    findApplicationAccessControl,
    replaceApplicationAccessControl,
  },
});

const { createRequester } = await import('#src/utils/test-utils.js');
const applicationRoutes = await pickDefault(import('./application.js'));
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
};

const createApplicationRequest = (isDevFeaturesEnabled = true) => {
  setDevFeaturesEnabled(isDevFeaturesEnabled);

  return createRequester({ authedRoutes: applicationRoutes, tenantContext });
};

const buildAccessControl = (
  patch: Partial<ApplicationAccessControl> = {}
): ApplicationAccessControl => ({
  userIds: ['user-1'],
  userRoleIds: ['role-1'],
  organizationIds: ['organization-1'],
  organizationRoleRules: [
    { organizationId: 'organization-2', organizationRoleIds: ['organization-role-1'] },
  ],
  ...patch,
});

describe('application access-control route', () => {
  afterEach(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
    findApplicationById.mockClear();
    updateApplicationById.mockClear();
    findApplicationAccessControl.mockClear();
    replaceApplicationAccessControl.mockClear();
  });

  it('PATCH /applications/:applicationId should gate app-level access control enablement by dev features', async () => {
    const applicationRequest = createApplicationRequest();

    const patch = { appLevelAccessControlEnabled: true };
    findApplicationAccessControl.mockResolvedValueOnce(buildAccessControl());

    const response = await applicationRequest.patch('/applications/foo').send(patch);

    expect(response.status).toEqual(200);
    expect(findApplicationAccessControl).toHaveBeenCalledWith('foo');
    expect(updateApplicationById).toHaveBeenCalledWith('foo', patch, 'replace');
    expect(response.body).toMatchObject(patch);

    updateApplicationById.mockClear();

    const disabledResponse = await createApplicationRequest(false)
      .patch('/applications/foo')
      .send(patch);

    expect(disabledResponse.status).toEqual(400);
    expect(updateApplicationById).not.toHaveBeenCalled();
  });

  it('PATCH /applications/:applicationId should reject enabling app-level access control with empty rules', async () => {
    const applicationRequest = createApplicationRequest();

    const response = await applicationRequest
      .patch('/applications/foo')
      .send({ appLevelAccessControlEnabled: true });

    expect(response.status).toEqual(422);
    expect(updateApplicationById).not.toHaveBeenCalled();
  });

  it('GET /applications/:applicationId/access-control should return empty rules by default', async () => {
    const applicationRequest = createApplicationRequest();

    const response = await applicationRequest.get('/applications/foo/access-control');

    expect(response.status).toEqual(200);
    expect(findApplicationById).toHaveBeenCalledWith('foo');
    expect(findApplicationAccessControl).toHaveBeenCalledWith('foo');
    expect(response.body).toEqual(createDefaultApplicationAccessControl());
  });

  it('GET /applications/:applicationId/access-control should be unavailable without dev features', async () => {
    const applicationRequest = createApplicationRequest(false);

    const response = await applicationRequest.get('/applications/foo/access-control');

    expect(response.status).toEqual(404);
    expect(findApplicationAccessControl).not.toHaveBeenCalled();
  });

  it('PUT /applications/:applicationId/access-control should validate and replace deduplicated rules', async () => {
    const applicationRequest = createApplicationRequest();

    const response = await applicationRequest.put('/applications/foo/access-control').send({
      userIds: ['user-1', 'user-2', 'user-1'],
      userRoleIds: ['role-1', 'role-1'],
      organizationIds: ['organization-1', 'organization-1'],
      organizationRoleRules: [
        {
          organizationId: 'organization-2',
          organizationRoleIds: ['organization-role-1', 'organization-role-1'],
        },
        {
          organizationId: 'organization-2',
          organizationRoleIds: ['organization-role-2'],
        },
      ],
    });

    const expectedAccessControl = buildAccessControl({
      userIds: ['user-1', 'user-2'],
      organizationRoleRules: [
        {
          organizationId: 'organization-2',
          organizationRoleIds: ['organization-role-1', 'organization-role-2'],
        },
      ],
    });

    expect(response.status).toEqual(200);
    expect(findApplicationById).toHaveBeenCalledWith('foo');
    expect(replaceApplicationAccessControl).toHaveBeenCalledWith('foo', expectedAccessControl);
    expect(response.body).toEqual(expectedAccessControl);
  });

  it('PUT /applications/:applicationId/access-control should reject empty organization-role groups', async () => {
    const applicationRequest = createApplicationRequest();

    const response = await applicationRequest.put('/applications/foo/access-control').send(
      buildAccessControl({
        organizationRoleRules: [{ organizationId: 'organization-2', organizationRoleIds: [] }],
      })
    );

    expect(response.status).toEqual(422);
    expect(replaceApplicationAccessControl).not.toHaveBeenCalled();
  });

  it('PUT /applications/:applicationId/access-control should reject empty rules when app-level access control is enabled', async () => {
    const applicationRequest = createApplicationRequest();
    findApplicationById.mockResolvedValueOnce({
      ...mockApplication,
      appLevelAccessControlEnabled: true,
    });

    const response = await applicationRequest
      .put('/applications/foo/access-control')
      .send(createDefaultApplicationAccessControl());

    expect(response.status).toEqual(422);
    expect(replaceApplicationAccessControl).not.toHaveBeenCalled();
  });

  it('PUT /applications/:applicationId/access-control should return 404 before validating references', async () => {
    const applicationRequest = createApplicationRequest();
    findApplicationById.mockRejectedValueOnce(
      new RequestError({
        code: 'entity.not_exists_with_id',
        status: 404,
        name: 'applications',
        id: 'foo',
      })
    );

    const response = await applicationRequest
      .put('/applications/foo/access-control')
      .send(buildAccessControl({ userIds: ['missing-user'] }));

    expect(response.status).toEqual(404);
    expect(replaceApplicationAccessControl).not.toHaveBeenCalled();
  });

  it('PUT /applications/:applicationId/access-control should be unavailable without dev features', async () => {
    const applicationRequest = createApplicationRequest(false);

    const response = await applicationRequest
      .put('/applications/foo/access-control')
      .send(buildAccessControl());

    expect(response.status).toEqual(404);
    expect(replaceApplicationAccessControl).not.toHaveBeenCalled();
  });
});
