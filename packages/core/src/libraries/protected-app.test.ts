// eslint-disable-next-line eslint-comments/disable-enable-pair -- max-lines applies to whole file
/* eslint-disable max-lines */
import { UserScope } from '@logto/core-kit';
import {
  ApplicationType,
  DomainStatus,
  SearchJointMode,
  type Application,
  type ApplicationSecret,
  type Domain,
} from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockDomain } from '#src/__mocks__/domain.js';
import {
  mockProtectedAppConfigProviderConfig,
  mockCloudflareData,
  mockCustomDomain,
  mockProtectedApplication,
} from '#src/__mocks__/index.js';
import { protectedAppSignInCallbackUrl } from '#src/constants/index.js';
import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
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
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const originalIsProtectedAppLocalDevEnabled = EnvSet.values.isProtectedAppLocalDevEnabled;
const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
};

const findApplications = jest.fn(async (): Promise<Application[]> => [mockProtectedApplication]);
const findApplicationById = jest.fn(async (): Promise<Application> => mockProtectedApplication);
const updateApplicationById = jest.fn(async (id: string, data: Partial<Application>) => ({
  ...mockProtectedApplication,
  ...data,
}));
const findAllDomains = jest.fn(async (): Promise<Domain[]> => []);
const mockApplicationSecret: ApplicationSecret = {
  tenantId: mockProtectedApplication.tenantId,
  applicationId: mockProtectedApplication.id,
  name: 'Default secret',
  value: 'active_application_secret',
  createdAt: Date.now(),
  expiresAt: null,
};
const findActiveSecretByApplicationId = jest.fn(async () => mockApplicationSecret);
const applicationSecrets = {
  async findActiveSecretByApplicationId(
    this: unknown,
    ...args: Parameters<typeof findActiveSecretByApplicationId>
  ) {
    if (!this) {
      throw new TypeError('findActiveSecretByApplicationId should be called with its query object');
    }

    return findActiveSecretByApplicationId(...args);
  },
};
const {
  syncAppConfigsToRemote,
  syncAllAppConfigsToRemote,
  buildProtectedAppData,
  syncAppCustomDomainStatus,
  getDefaultDomain,
  deleteDomainFromRemote,
} = createProtectedAppLibrary(
  new MockQueries({
    applications: {
      findApplications,
      findApplicationById,
      updateApplicationById,
    },
    domains: {
      findAllDomains,
    },
    applicationSecrets,
  })
);

const protectedAppConfigProviderConfig = {
  accountIdentifier: 'fake_account_id',
  namespaceIdentifier: 'fake_namespace_id',
  keyName: 'fake_key_name',
  apiToken: '',
  domain: 'protected.app',
};
const activeDomain = { ...mockDomain, domain: 'secure.example.com', status: DomainStatus.Active };
const mockProtectedApplicationWithCustomDomain = {
  ...mockProtectedApplication,
  protectedAppMetadata: {
    ...mockProtectedApplication.protectedAppMetadata,
    customDomains: [mockCustomDomain],
  },
};
const getSdkConfig = ({ id }: Application, endpoint: string) => ({
  appId: id,
  appSecret: mockApplicationSecret.value,
  endpoint,
});

const setProtectedAppLocalDevEnabled = (value: boolean) => {
  Reflect.set(EnvSet.values, 'isProtectedAppLocalDevEnabled', value);
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
  setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  setProtectedAppLocalDevEnabled(originalIsProtectedAppLocalDevEnabled);
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.protectedAppConfigProviderConfig = protectedAppConfigProviderConfig;
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.protectedAppHostnameProviderConfig = {
    zoneId: 'fake_zone_id',
    apiToken: '',
    blockedDomains: ['blocked.com'],
  };
  updateProtectedAppSiteConfigs.mockClear();
  findApplications.mockClear();
  findApplicationById.mockClear();
  findAllDomains.mockReset();
  findAllDomains.mockResolvedValue([]);
  findActiveSecretByApplicationId.mockClear();
});

describe('syncAppConfigsToRemote()', () => {
  it('should skip if protectedAppMetadata is missing', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockProtectedApplication,
      protectedAppMetadata: null,
    });
    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();
    expect(updateProtectedAppSiteConfigs).not.toBeCalled();
    expect(findActiveSecretByApplicationId).not.toBeCalled();
  });

  it('should sync configs to remote', async () => {
    findApplicationById.mockResolvedValueOnce(mockProtectedApplication);
    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();
    const { protectedAppMetadata, id } = mockProtectedApplication;
    expect(findActiveSecretByApplicationId).toHaveBeenCalledWith(mockProtectedApplication.id);
    expect(updateProtectedAppSiteConfigs).toHaveBeenCalledWith(
      mockProtectedAppConfigProviderConfig,
      protectedAppMetadata.host,
      {
        ...protectedAppMetadata,
        sdkConfig: {
          appId: id,
          appSecret: mockApplicationSecret.value,
          // Avoid mocking envset
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endpoint: expect.anything(),
        },
      }
    );
  });

  it('should throw a clear error if no active secret is found', async () => {
    findApplicationById.mockResolvedValueOnce(mockProtectedApplication);
    findActiveSecretByApplicationId.mockRejectedValueOnce(
      new RequestError({
        code: 'application.protected_application_misconfigured',
        status: 422,
      })
    );

    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).rejects.toThrow(
      new RequestError({
        code: 'application.protected_application_misconfigured',
        status: 422,
      })
    );
    expect(updateProtectedAppSiteConfigs).not.toBeCalled();
  });

  it('should sync custom domains configs to remote', async () => {
    findApplicationById.mockResolvedValueOnce(mockProtectedApplicationWithCustomDomain);
    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();
    const { protectedAppMetadata, id } = mockProtectedApplication;
    expect(updateProtectedAppSiteConfigs).toHaveBeenLastCalledWith(
      protectedAppConfigProviderConfig,
      mockCustomDomain.domain,
      {
        ...protectedAppMetadata,
        host: mockCustomDomain.domain,
        sdkConfig: {
          appId: id,
          appSecret: mockApplicationSecret.value,
          // Avoid mocking envset
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endpoint: expect.anything(),
        },
      }
    );
  });

  it('should use active tenant custom domain as SDK endpoint when dev features are enabled', async () => {
    setDevFeaturesEnabled(true);
    findAllDomains.mockResolvedValueOnce([activeDomain]);
    findApplicationById.mockResolvedValueOnce(mockProtectedApplicationWithCustomDomain);

    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();

    expect(updateProtectedAppSiteConfigs).toHaveBeenNthCalledWith(
      1,
      protectedAppConfigProviderConfig,
      mockProtectedApplication.protectedAppMetadata.host,
      expect.objectContaining({
        sdkConfig: getSdkConfig(mockProtectedApplication, 'https://secure.example.com'),
      })
    );
    expect(updateProtectedAppSiteConfigs).toHaveBeenLastCalledWith(
      protectedAppConfigProviderConfig,
      mockCustomDomain.domain,
      expect.objectContaining({
        host: mockCustomDomain.domain,
        sdkConfig: getSdkConfig(mockProtectedApplication, 'https://secure.example.com'),
      })
    );
  });

  it('should keep the default SDK endpoint when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    findAllDomains.mockResolvedValueOnce([activeDomain]);
    findApplicationById.mockResolvedValueOnce(mockProtectedApplication);

    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();

    expect(findAllDomains).not.toHaveBeenCalled();
    expect(updateProtectedAppSiteConfigs).toHaveBeenCalledWith(
      protectedAppConfigProviderConfig,
      mockProtectedApplication.protectedAppMetadata.host,
      expect.objectContaining({
        sdkConfig: getSdkConfig(
          mockProtectedApplication,
          getTenantEndpoint(mockProtectedApplication.tenantId, EnvSet.values).origin
        ),
      })
    );
  });

  it('should skip remote sync in protected app local dev mode', async () => {
    setProtectedAppLocalDevEnabled(true);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    SystemContext.shared.protectedAppConfigProviderConfig = undefined;

    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();

    expect(updateProtectedAppSiteConfigs).not.toHaveBeenCalled();
  });

  it('should omit additional scopes when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    findApplicationById.mockResolvedValueOnce({
      ...mockProtectedApplication,
      protectedAppMetadata: {
        ...mockProtectedApplication.protectedAppMetadata,
        additionalScopes: [UserScope.CustomData],
      },
    });

    await expect(syncAppConfigsToRemote(mockProtectedApplication.id)).resolves.not.toThrow();

    expect(updateProtectedAppSiteConfigs).toHaveBeenCalledWith(
      mockProtectedAppConfigProviderConfig,
      mockProtectedApplication.protectedAppMetadata.host,
      expect.any(Object)
    );
    expect(updateProtectedAppSiteConfigs.mock.calls[0]?.[2]).not.toHaveProperty('additionalScopes');
  });
});

describe('syncAllAppConfigsToRemote()', () => {
  it('should skip syncing all protected app configs when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    await expect(syncAllAppConfigsToRemote()).resolves.not.toThrow();

    expect(findApplications).not.toHaveBeenCalled();
    expect(updateProtectedAppSiteConfigs).not.toHaveBeenCalled();
  });

  it('should sync all protected app configs when dev features are enabled', async () => {
    setDevFeaturesEnabled(true);
    const anotherProtectedApplication = {
      ...mockProtectedApplication,
      id: 'protected-app-id-2',
      secret: 'secret-2',
      protectedAppMetadata: {
        ...mockProtectedApplication.protectedAppMetadata,
        host: 'app-2.protected.app',
      },
    };
    findAllDomains.mockResolvedValueOnce([activeDomain]);
    findApplications.mockResolvedValueOnce([mockProtectedApplication, anotherProtectedApplication]);
    findApplicationById
      .mockResolvedValueOnce(mockProtectedApplication)
      .mockResolvedValueOnce(anotherProtectedApplication);

    await expect(syncAllAppConfigsToRemote()).resolves.not.toThrow();

    expect(findApplications).toHaveBeenCalledWith({
      search: { matches: [], joint: SearchJointMode.Or, isCaseSensitive: false },
      types: [ApplicationType.Protected],
    });
    expect(findAllDomains).toHaveBeenCalledTimes(1);
    expect(findApplicationById).toHaveBeenNthCalledWith(1, mockProtectedApplication.id);
    expect(findApplicationById).toHaveBeenNthCalledWith(2, anotherProtectedApplication.id);
    expect(updateProtectedAppSiteConfigs).toHaveBeenNthCalledWith(
      1,
      protectedAppConfigProviderConfig,
      mockProtectedApplication.protectedAppMetadata.host,
      expect.objectContaining({
        sdkConfig: getSdkConfig(mockProtectedApplication, 'https://secure.example.com'),
      })
    );
    expect(updateProtectedAppSiteConfigs).toHaveBeenNthCalledWith(
      2,
      protectedAppConfigProviderConfig,
      anotherProtectedApplication.protectedAppMetadata.host,
      expect.objectContaining({
        sdkConfig: getSdkConfig(anotherProtectedApplication, 'https://secure.example.com'),
      })
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
        additionalScopes: [],
      },
      oidcClientMetadata: {
        redirectUris: [`https://${host}/${protectedAppSignInCallbackUrl}`],
        postLogoutRedirectUris: [`https://${host}`],
      },
    });
  });

  it('should omit additional scopes when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
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

  it('should get local default domain in protected app local dev mode', async () => {
    setProtectedAppLocalDevEnabled(true);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    SystemContext.shared.protectedAppConfigProviderConfig = undefined;

    await expect(getDefaultDomain()).resolves.toBe('protected-app.localhost');
  });
});

describe('syncAppCustomDomainStatus()', () => {
  afterEach(() => {
    updateApplicationById.mockClear();
  });

  it('should return application with synced domains', async () => {
    findApplicationById.mockResolvedValueOnce(mockProtectedApplicationWithCustomDomain);
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

  it('should skip domain status sync in protected app local dev mode', async () => {
    setProtectedAppLocalDevEnabled(true);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    SystemContext.shared.protectedAppHostnameProviderConfig = undefined;
    findApplicationById.mockResolvedValueOnce(mockProtectedApplicationWithCustomDomain);

    await expect(syncAppCustomDomainStatus(mockProtectedApplication.id)).resolves.toMatchObject({
      protectedAppMetadata: {
        customDomains: [mockCustomDomain],
      },
    });
    expect(updateApplicationById).not.toHaveBeenCalled();
  });
});

describe('deleteDomainFromRemote()', () => {
  it('should call deleteCustomHostname', async () => {
    await deleteDomainFromRemote('id');
    expect(deleteCustomHostname).toHaveBeenCalled();
  });
});
