import { ApplicationType, BindingType, NameIdFormat, type Application } from '@logto/schemas';

import { mockApplication } from '#src/__mocks__/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createSamlApplicationsLibrary } from './saml-applications.js';

const { jest } = import.meta;

const mockSamlApplication: Application = {
  ...mockApplication,
  type: ApplicationType.SAML,
};
const mockSamlConfig = {
  tenantId: mockSamlApplication.tenantId,
  applicationId: mockSamlApplication.id,
  entityId: 'sp-entity-id',
  acsUrl: {
    binding: BindingType.Post,
    url: 'https://example.com/acs',
  },
  attributeMapping: {},
  encryption: {},
  nameIdFormat: NameIdFormat.Persistent,
};

const findApplicationById = jest.fn(async () => mockSamlApplication);
const updateApplicationById = jest.fn(async (_, data) => ({
  ...mockSamlApplication,
  ...data,
}));
const findSamlApplicationConfigByApplicationId = jest.fn(async () => mockSamlConfig);
const updateSamlApplicationConfig = jest.fn(async ({ set }) => set);

const createLibrary = () =>
  createSamlApplicationsLibrary(
    new MockQueries({
      applications: {
        findApplicationById,
        updateApplicationById,
      },
      samlApplicationConfigs: {
        findSamlApplicationConfigByApplicationId,
        updateSamlApplicationConfig,
      },
    })
  );

describe('createSamlApplicationsLibrary()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updateSamlApplicationById() should update app-level access control enablement on the application record', async () => {
    const result = await createLibrary().updateSamlApplicationById('foo', {
      appLevelAccessControlEnabled: true,
    });

    expect(updateApplicationById).toHaveBeenCalledWith('foo', {
      appLevelAccessControlEnabled: true,
    });
    expect(updateSamlApplicationConfig).not.toHaveBeenCalled();
    expect(result.appLevelAccessControlEnabled).toBe(true);
  });
});
