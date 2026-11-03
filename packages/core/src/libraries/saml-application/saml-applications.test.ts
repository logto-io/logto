import {
  ApplicationType,
  BindingType,
  NameIdFormat,
  type Application,
  type PatchSamlApplication,
  type SamlApplicationConfig,
} from '@logto/schemas';

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
  authnRequestConfig: null,
  nameIdFormat: NameIdFormat.Persistent,
  staticAttributes: {},
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
  it('rejects an invalid signing certificate before updating any records', async () => {
    await expect(
      createLibrary().updateSamlApplicationById('foo', {
        name: 'new name',
        authnRequestConfig: { requireSignedAuthnRequests: true, signingCertificate: 'invalid' },
      })
    ).rejects.toThrow();
    expect(updateSamlApplicationConfig).not.toHaveBeenCalled();
    expect(updateApplicationById).not.toHaveBeenCalled();
  });

  it.each([{ forceAuthn: true }, null])(
    'persists authentication policy: %j',
    async (authnRequestConfig) => {
      const result = await createLibrary().updateSamlApplicationById('foo', { authnRequestConfig });
      expect(updateSamlApplicationConfig).toHaveBeenCalledWith({
        set: { ...mockSamlConfig, authnRequestConfig },
        where: { applicationId: 'foo' },
        jsonbMode: 'replace',
      });
      expect(result.authnRequestConfig).toEqual(authnRequestConfig);
      expect(updateApplicationById).not.toHaveBeenCalled();
    }
  );

  it('persists static attributes', async () => {
    const staticAttributes = { site: '2' };
    const result = await createLibrary().updateSamlApplicationById('foo', { staticAttributes });
    expect(updateSamlApplicationConfig).toHaveBeenCalledWith({
      set: { ...mockSamlConfig, staticAttributes },
      where: { applicationId: 'foo' },
      jsonbMode: 'replace',
    });
    expect(result.staticAttributes).toEqual(staticAttributes);
  });

  it.each<{
    stored: Partial<Pick<SamlApplicationConfig, 'attributeMapping' | 'staticAttributes'>>;
    patch: PatchSamlApplication;
  }>([
    {
      stored: { staticAttributes: { site: '2' } },
      patch: { attributeMapping: { email: 'site' } },
    },
    {
      stored: { attributeMapping: { email: 'mail' } },
      patch: { staticAttributes: { mail: 'x' } },
    },
    { stored: {}, patch: { staticAttributes: { email: 'x' } } },
    {
      stored: { attributeMapping: { email: 'mail' }, staticAttributes: { email: 'x' } },
      patch: { attributeMapping: {} },
    },
  ])('rejects a conflict with the stored config: %j', async ({ stored, patch }) => {
    findSamlApplicationConfigByApplicationId.mockResolvedValueOnce({
      ...mockSamlConfig,
      ...stored,
    });
    await expect(createLibrary().updateSamlApplicationById('foo', patch)).rejects.toMatchObject({
      code: 'application.saml.static_attribute_name_conflict',
    });
    expect(updateSamlApplicationConfig).not.toHaveBeenCalled();
  });

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
