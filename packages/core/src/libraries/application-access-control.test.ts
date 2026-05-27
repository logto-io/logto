import {
  accountCenterApplicationId,
  createDefaultApplicationAccessControl,
  type Application,
  type ApplicationAccessControl,
} from '@logto/schemas';

import { mockApplication } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createApplicationAccessControlLibrary } from './application-access-control.js';

const { jest } = import.meta;

const userId = 'user-id';
const applicationId = 'application-id';
const enabledApplication: Application = {
  ...mockApplication,
  id: applicationId,
  appLevelAccessControlEnabled: true,
};
const disabledApplication: Application = {
  ...enabledApplication,
  appLevelAccessControlEnabled: false,
};

const buildAccessControl = (
  patch: Partial<ApplicationAccessControl> = {}
): ApplicationAccessControl => ({
  ...createDefaultApplicationAccessControl(),
  ...patch,
});

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const findApplicationById = jest.fn(async () => enabledApplication);
const findApplicationAccessControl = jest.fn(async () => createDefaultApplicationAccessControl());
const hasUserRole = jest.fn(async () => false);
const getExistingOrganizationIds = jest.fn(async (): Promise<string[]> => []);
const hasUserOrganizationRole = jest.fn(async () => false);

const createLibrary = () => {
  const queries = new MockQueries({
    applications: { findApplicationById },
    applicationAccessControl: { findApplicationAccessControl },
    usersRoles: { hasUserRole },
  });

  jest
    .spyOn(queries.organizations.relations.users, 'getExistingOrganizationIds')
    .mockImplementation(getExistingOrganizationIds);
  jest
    .spyOn(queries.organizations.relations.usersRoles, 'hasUserOrganizationRole')
    .mockImplementation(hasUserOrganizationRole);

  return createApplicationAccessControlLibrary(queries);
};

const setDevFeaturesEnabled = (value: boolean) => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', value);
};

beforeEach(() => {
  setDevFeaturesEnabled(true);
  findApplicationById.mockResolvedValue(enabledApplication);
  findApplicationAccessControl.mockResolvedValue(createDefaultApplicationAccessControl());
  hasUserRole.mockResolvedValue(false);
  getExistingOrganizationIds.mockResolvedValue([]);
  hasUserOrganizationRole.mockResolvedValue(false);
});

afterEach(() => {
  setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  jest.clearAllMocks();
});

describe('assertUserHasApplicationAccess()', () => {
  it('allows without querying the application when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).resolves.not.toThrow();

    expect(findApplicationById).not.toHaveBeenCalled();
    expect(findApplicationAccessControl).not.toHaveBeenCalled();
  });

  it('allows built-in applications without querying the application', async () => {
    await expect(
      createLibrary().assertUserHasApplicationAccess(accountCenterApplicationId, userId)
    ).resolves.not.toThrow();

    expect(findApplicationById).not.toHaveBeenCalled();
    expect(findApplicationAccessControl).not.toHaveBeenCalled();
  });

  it('allows without querying rule tables when app-level access control is disabled', async () => {
    findApplicationById.mockResolvedValueOnce(disabledApplication);

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).resolves.not.toThrow();

    expect(findApplicationById).toHaveBeenCalledWith(applicationId);
    expect(findApplicationAccessControl).not.toHaveBeenCalled();
    expect(hasUserRole).not.toHaveBeenCalled();
    expect(getExistingOrganizationIds).not.toHaveBeenCalled();
    expect(hasUserOrganizationRole).not.toHaveBeenCalled();
  });

  it('denies access without revealing missing applications', async () => {
    findApplicationById.mockRejectedValueOnce(
      new RequestError({
        code: 'entity.not_exists_with_id',
        status: 404,
        name: 'applications',
        id: applicationId,
      })
    );

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).rejects.toMatchObject(new RequestError('oidc.access_denied'));
  });

  it('allows direct selected user', async () => {
    findApplicationAccessControl.mockResolvedValueOnce(buildAccessControl({ userIds: [userId] }));

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).resolves.not.toThrow();

    expect(hasUserRole).not.toHaveBeenCalled();
    expect(getExistingOrganizationIds).not.toHaveBeenCalled();
    expect(hasUserOrganizationRole).not.toHaveBeenCalled();
  });

  it('allows selected user role membership', async () => {
    findApplicationAccessControl.mockResolvedValueOnce(
      buildAccessControl({ userRoleIds: ['role-id'] })
    );
    hasUserRole.mockResolvedValueOnce(true);

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).resolves.not.toThrow();

    expect(hasUserRole).toHaveBeenCalledWith(userId, ['role-id']);
    expect(getExistingOrganizationIds).not.toHaveBeenCalled();
    expect(hasUserOrganizationRole).not.toHaveBeenCalled();
  });

  it('allows selected organization membership', async () => {
    findApplicationAccessControl.mockResolvedValueOnce(
      buildAccessControl({ organizationIds: ['organization-id'] })
    );
    getExistingOrganizationIds.mockResolvedValueOnce(['organization-id']);

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).resolves.not.toThrow();

    expect(getExistingOrganizationIds).toHaveBeenCalledWith(userId, ['organization-id']);
    expect(hasUserOrganizationRole).not.toHaveBeenCalled();
  });

  it('allows selected organization-role assignment in the selected organization', async () => {
    findApplicationAccessControl.mockResolvedValueOnce(
      buildAccessControl({
        organizationRoleRules: [
          { organizationId: 'organization-id', organizationRoleIds: ['organization-role-id'] },
        ],
      })
    );
    hasUserOrganizationRole.mockResolvedValueOnce(true);

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).resolves.not.toThrow();

    expect(hasUserOrganizationRole).toHaveBeenCalledWith(userId, [
      { organizationId: 'organization-id', organizationRoleId: 'organization-role-id' },
    ]);
  });

  it('denies organization membership when that organization is not selected', async () => {
    findApplicationAccessControl.mockResolvedValueOnce(
      buildAccessControl({ organizationIds: ['selected-organization-id'] })
    );

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).rejects.toMatchObject(new RequestError('oidc.access_denied'));

    expect(getExistingOrganizationIds).toHaveBeenCalledWith(userId, ['selected-organization-id']);
  });

  it('denies selected organization role when it belongs to a different organization', async () => {
    findApplicationAccessControl.mockResolvedValueOnce(
      buildAccessControl({
        organizationRoleRules: [
          { organizationId: 'selected-organization-id', organizationRoleIds: ['role-id'] },
        ],
      })
    );

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).rejects.toMatchObject(new RequestError('oidc.access_denied'));

    expect(hasUserOrganizationRole).toHaveBeenCalledWith(userId, [
      { organizationId: 'selected-organization-id', organizationRoleId: 'role-id' },
    ]);
  });

  it('denies enabled config with no matching rules', async () => {
    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).rejects.toMatchObject(new RequestError('oidc.access_denied'));
  });

  it('delegates empty rule arrays to guarded query helpers', async () => {
    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).rejects.toMatchObject(new RequestError('oidc.access_denied'));

    expect(hasUserRole).toHaveBeenCalledWith(userId, []);
    expect(getExistingOrganizationIds).toHaveBeenCalledWith(userId, []);
    expect(hasUserOrganizationRole).toHaveBeenCalledWith(userId, []);
  });
});
