import { accountCenterApplicationId, type Application } from '@logto/schemas';

import { mockApplication } from '#src/__mocks__/index.js';
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

const findApplicationById = jest.fn(async () => enabledApplication);
const hasUserApplicationAccess = jest.fn(async () => false);

const createLibrary = () => {
  const queries = new MockQueries({
    applications: { findApplicationById },
    applicationAccessControl: { hasUserApplicationAccess },
  });

  return createApplicationAccessControlLibrary(queries);
};

beforeEach(() => {
  findApplicationById.mockResolvedValue(enabledApplication);
  hasUserApplicationAccess.mockResolvedValue(false);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('assertUserHasApplicationAccess()', () => {
  it('allows built-in applications without querying the application', async () => {
    await expect(
      createLibrary().assertUserHasApplicationAccess(accountCenterApplicationId, userId)
    ).resolves.not.toThrow();

    expect(findApplicationById).not.toHaveBeenCalled();
    expect(hasUserApplicationAccess).not.toHaveBeenCalled();
  });

  it('allows without querying rule tables when app-level access control is disabled', async () => {
    findApplicationById.mockResolvedValueOnce(disabledApplication);

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).resolves.not.toThrow();

    expect(findApplicationById).toHaveBeenCalledWith(applicationId);
    expect(hasUserApplicationAccess).not.toHaveBeenCalled();
  });

  it('allows disabled app-level access control from a request-local gate hint', async () => {
    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId, false)
    ).resolves.not.toThrow();

    expect(findApplicationById).not.toHaveBeenCalled();
    expect(hasUserApplicationAccess).not.toHaveBeenCalled();
  });

  it('uses request-local enabled gate hint without querying the application', async () => {
    hasUserApplicationAccess.mockResolvedValueOnce(true);

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId, true)
    ).resolves.not.toThrow();

    expect(findApplicationById).not.toHaveBeenCalled();
    expect(hasUserApplicationAccess).toHaveBeenCalledWith(applicationId, userId);
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

  it('allows when the evaluator finds any matching access rule', async () => {
    hasUserApplicationAccess.mockResolvedValueOnce(true);

    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).resolves.not.toThrow();

    expect(hasUserApplicationAccess).toHaveBeenCalledWith(applicationId, userId);
  });

  it('denies enabled config with no matching rules', async () => {
    await expect(
      createLibrary().assertUserHasApplicationAccess(applicationId, userId)
    ).rejects.toMatchObject(new RequestError('oidc.access_denied'));

    expect(hasUserApplicationAccess).toHaveBeenCalledWith(applicationId, userId);
  });
});
