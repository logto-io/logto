import {
  accountCenterApplicationId,
  Applications,
  demoAppApplicationId,
  deviceDemoAppApplicationId,
  type Application,
} from '@logto/schemas';

import { mockApplication } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { isThirdPartyApplication, resolveIsThirdPartyApplication } from './resource.js';

const { jest } = import.meta;

describe('isThirdPartyApplication()', () => {
  const findApplicationById = jest.fn(async (): Promise<Application> => mockApplication);
  const queries = new MockQueries({ applications: { findApplicationById } });

  afterEach(() => {
    findApplicationById.mockClear();
  });

  it.each([demoAppApplicationId, accountCenterApplicationId, deviceDemoAppApplicationId])(
    'should treat the built-in client %s as first-party without a database lookup',
    async (applicationId) => {
      await expect(isThirdPartyApplication(queries, applicationId)).resolves.toBe(false);
      expect(findApplicationById).not.toHaveBeenCalled();
    }
  );

  it('should return the stored flag for a registered application', async () => {
    findApplicationById.mockResolvedValueOnce({ ...mockApplication, isThirdParty: true });
    await expect(isThirdPartyApplication(queries, mockApplication.id)).resolves.toBe(true);

    findApplicationById.mockResolvedValueOnce({ ...mockApplication, isThirdParty: false });
    await expect(isThirdPartyApplication(queries, mockApplication.id)).resolves.toBe(false);
  });

  it('should treat a CIMD client identifier as third-party without a database lookup', async () => {
    await expect(
      isThirdPartyApplication(queries, 'https://client.example.com/metadata.json')
    ).resolves.toBe(true);
    expect(findApplicationById).not.toHaveBeenCalled();
  });

  it('should fail closed to third-party when the application cannot be resolved', async () => {
    findApplicationById.mockRejectedValueOnce(new Error('not found'));
    await expect(isThirdPartyApplication(queries, 'deleted_application_id')).resolves.toBe(true);
  });
});

describe('resolveIsThirdPartyApplication()', () => {
  const findApplicationById = jest.fn(async (): Promise<Application> => mockApplication);
  const queries = new MockQueries({ applications: { findApplicationById } });

  afterEach(() => {
    findApplicationById.mockClear();
  });

  it.each([demoAppApplicationId, accountCenterApplicationId, deviceDemoAppApplicationId])(
    'should treat the built-in client %s as first-party without a database lookup',
    async (applicationId) => {
      await expect(resolveIsThirdPartyApplication(queries, applicationId)).resolves.toBe(false);
      expect(findApplicationById).not.toHaveBeenCalled();
    }
  );

  it('should treat a CIMD client identifier as third-party without a database lookup', async () => {
    await expect(
      resolveIsThirdPartyApplication(queries, 'https://client.example.com/metadata.json')
    ).resolves.toBe(true);
    expect(findApplicationById).not.toHaveBeenCalled();
  });

  it('should return the stored flag for a registered application', async () => {
    findApplicationById.mockResolvedValueOnce({ ...mockApplication, isThirdParty: true });
    await expect(resolveIsThirdPartyApplication(queries, mockApplication.id)).resolves.toBe(true);

    findApplicationById.mockResolvedValueOnce({ ...mockApplication, isThirdParty: false });
    await expect(resolveIsThirdPartyApplication(queries, mockApplication.id)).resolves.toBe(false);
  });

  it('should return undefined when the application does not exist', async () => {
    findApplicationById.mockRejectedValueOnce(
      new RequestError({
        code: 'entity.not_exists_with_id',
        name: Applications.table,
        id: 'deleted_application_id',
        status: 404,
      })
    );

    await expect(
      resolveIsThirdPartyApplication(queries, 'deleted_application_id')
    ).resolves.toBeUndefined();
  });

  /** A transient failure must stay distinguishable from a client that genuinely does not exist. */
  it('should rethrow an unexpected lookup failure', async () => {
    const error = new Error('connection terminated unexpectedly');
    findApplicationById.mockRejectedValueOnce(error);

    await expect(resolveIsThirdPartyApplication(queries, mockApplication.id)).rejects.toBe(error);
  });
});
