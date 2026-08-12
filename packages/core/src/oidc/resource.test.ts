import {
  accountCenterApplicationId,
  demoAppApplicationId,
  deviceDemoAppApplicationId,
  type Application,
} from '@logto/schemas';

import { mockApplication } from '#src/__mocks__/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { isThirdPartyApplication } from './resource.js';

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
