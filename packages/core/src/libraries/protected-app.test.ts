import { createMockUtils } from '@logto/shared/esm';

import { mockProtectedApplication } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  defaultProtectedAppPageRules,
  defaultProtectedAppSessionDuration,
} from '#src/routes/applications/constants.js';
import SystemContext from '#src/tenants/SystemContext.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { updateProtectedAppSiteConfigs } = await mockEsmWithActual(
  '#src/utils/cloudflare/index.js',
  () => ({
    updateProtectedAppSiteConfigs: jest.fn(),
  })
);

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createProtectedAppLibrary } = await import('./protected-app.js');

const findApplicationById = jest.fn(async () => mockProtectedApplication);
const findApplicationByProtectedAppHost = jest.fn();
const { syncAppConfigsToRemote, checkAndBuildProtectedAppData } = createProtectedAppLibrary(
  new MockQueries({ applications: { findApplicationById, findApplicationByProtectedAppHost } })
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
      protectedAppConfigProviderConfig,
      protectedAppMetadata?.host,
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
});

describe('checkAndBuildProtectedAppData()', () => {
  const origin = 'https://example.com';

  it('should throw if subdomain is invalid', async () => {
    await expect(checkAndBuildProtectedAppData({ subDomain: 'a-', origin })).rejects.toThrowError(
      new RequestError({
        code: 'application.invalid_subdomain',
        status: 422,
      })
    );
  });

  it('should throw if subdomain is not available', async () => {
    findApplicationByProtectedAppHost.mockResolvedValueOnce(mockProtectedApplication);
    await expect(checkAndBuildProtectedAppData({ subDomain: 'a', origin })).rejects.toThrowError(
      new RequestError({
        code: 'application.protected_application_subdomain_exists',
        status: 422,
      })
    );
  });

  it('should return data if subdomain is available', async () => {
    const subDomain = 'a';
    const host = `${subDomain}.${protectedAppConfigProviderConfig.domain}`;
    await expect(checkAndBuildProtectedAppData({ subDomain, origin })).resolves.toEqual({
      protectedAppMetadata: {
        host,
        origin,
        sessionDuration: defaultProtectedAppSessionDuration,
        pageRules: defaultProtectedAppPageRules,
      },
      oidcClientMetadata: {
        redirectUris: [`https://${host}/callback`],
        postLogoutRedirectUris: [`https://${host}`],
      },
    });
  });
});
