import { type Application } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import {
  mockProtectedAppConfigProviderConfig,
  mockCloudflareData,
  mockCustomDomain,
  mockProtectedApplication,
} from '#src/__mocks__/index.js';
import { protectedAppSignInCallbackUrl } from '#src/constants/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  defaultProtectedAppPageRules,
  defaultProtectedAppSessionDuration,
} from '#src/routes/applications/constants.js';
import SystemContext from '#src/tenants/SystemContext.js';
import { mockFallbackOrigin } from '#src/utils/cloudflare/mock.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { updateProtectedAppSiteConfigs, deleteCustomHostname } = await mockEsmWithActual(
  '#src/utils/cloudflare/index.js',
  () => ({
    updateProtectedAppSiteConfigs: jest.fn(),
    getCustomHostname: jest.fn(async () => mockCloudflareData),
    getFallbackOrigin: jest.fn(async () => mockFallbackOrigin),
    deleteCustomHostname: jest.fn(),
  })
);

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createProtectedAppLibrary } = await import('./protected-app.js');

const findApplicationById = jest.fn(async (): Promise<Application> => mockProtectedApplication);
const updateApplicationById = jest.fn(async (id: string, data: Partial<Application>) => ({
  ...mockProtectedApplication,
  ...data,
}));
const {
  syncAppConfigsToRemote,
  buildProtectedAppData,
  syncAppCustomDomainStatus,
  getDefaultDomain,
  deleteDomainFromRemote,
} = createProtectedAppLibrary(
  new MockQueries({
    applications: {
      findApplicationById,
      updateApplicationById,
    },
  })
);

const protectedAppConfigProviderConfig = {
  accountIdentifier: 'fake_account_id',
  namespaceIdentifier: 'fake_namespace_id',
  keyName: 'fake_key_name',
  apiToken: '',
  domain: 'protected.app',
};

beforeAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.protectedAppConfigProviderConfig = protectedAppConfigProviderConfig;
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.protectedAppHostnameProviderConfig = {
    zoneId: 'fake_zone_id',
    apiToken: '',
    blockedDomains: ['blocked.com'],
  };
});

afterAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.protectedAppConfigProviderConfig = undefined;
});

afterEach(() => {
  updateProtectedAppSiteConfigs.mockClear();
});

describe('syncAppConfigsToRemote()', () => {
  it('should skip if protectedAppMetadata is missing', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockProtectedApplication,
      protectedAppMetadata: null,
    });
    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();
    expect(updateProtectedAppSiteConfigs).not.toBeCalled();
  });

  it('should sync configs to remote', async () => {
    findApplicationById.mockResolvedValueOnce(mockProtectedApplication);
    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();
    const { protectedAppMetadata, id, secret } = mockProtectedApplication;
    expect(updateProtectedAppSiteConfigs).toHaveBeenCalledWith(
      mockProtectedAppConfigProviderConfig,
      protectedAppMetadata.host,
      {
        ...protectedAppMetadata,
        sdkConfig: {
          appId: id,
          appSecret: secret,
          // Avoid mocking envset
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endpoint: expect.anything(),
        },
      }
    );
  });

  it('should sync custom domains configs to remote', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockProtectedApplication,
      protectedAppMetadata: {
        ...mockProtectedApplication.protectedAppMetadata,
        customDomains: [mockCustomDomain],
      },
    });
    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();
    const { protectedAppMetadata, id, secret } = mockProtectedApplication;
    expect(updateProtectedAppSiteConfigs).toHaveBeenLastCalledWith(
      protectedAppConfigProviderConfig,
      mockCustomDomain.domain,
      {
        ...protectedAppMetadata,
        host: mockCustomDomain.domain,
        sdkConfig: {
          appId: id,
          appSecret: secret,
          // Avoid mocking envset
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endpoint: expect.anything(),
        },
      }
    );
  });
});

describe('buildProtectedAppData()', () => {
  const origin = 'https://example.com';

  it('should throw if subdomain is invalid', async () => {
    await expect(buildProtectedAppData({ subDomain: 'a-', origin })).rejects.toThrowError(
      new RequestError({
        code: 'application.invalid_subdomain',
        status: 422,
      })
    );
  });

  it('should return data if subdomain is available', async () => {
    const subDomain = 'a';
    const host = `${subDomain}.${mockProtectedAppConfigProviderConfig.domain}`;
    await expect(buildProtectedAppData({ subDomain, origin })).resolves.toEqual({
      protectedAppMetadata: {
        host,
        origin,
        sessionDuration: defaultProtectedAppSessionDuration,
        pageRules: defaultProtectedAppPageRules,
      },
      oidcClientMetadata: {
        redirectUris: [`https://${host}/${protectedAppSignInCallbackUrl}`],
        postLogoutRedirectUris: [`https://${host}`],
      },
    });
  });
});

describe('getDefaultDomain()', () => {
  it('should get default domain', async () => {
    await expect(getDefaultDomain()).resolves.toBe(mockProtectedAppConfigProviderConfig.domain);
  });
});

describe('syncAppCustomDomainStatus()', () => {
  afterEach(() => {
    updateApplicationById.mockClear();
  });

  it('should return application with synced domains', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockProtectedApplication,
      protectedAppMetadata: {
        ...mockProtectedApplication.protectedAppMetadata,
        customDomains: [mockCustomDomain],
      },
    });
    await expect(syncAppCustomDomainStatus(mockProtectedApplication.id)).resolves.toMatchObject({
      protectedAppMetadata: {
        customDomains: [
          {
            ...mockCustomDomain,
            cloudflareData: mockCloudflareData,
          },
        ],
      },
    });
    expect(updateApplicationById).toHaveBeenCalled();
  });

  it('should skip when custom domains are empty', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockProtectedApplication,
      protectedAppMetadata: {
        ...mockProtectedApplication.protectedAppMetadata,
        customDomains: [],
      },
    });
    await syncAppCustomDomainStatus(mockProtectedApplication.id);
    expect(updateApplicationById).not.toHaveBeenCalled();
  });
});

describe('deleteDomainFromRemote()', () => {
  it('should call deleteCustomHostname', async () => {
    await deleteDomainFromRemote('id');
    expect(deleteCustomHostname).toHaveBeenCalled();
  });
});
