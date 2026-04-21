import { LogtoOidcConfigKey, OidcSigningKeyStatus } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import Sinon from 'sinon';

import { mockAdminConsoleData, mockCookieKeys, mockPrivateKeys } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { mockEsmWithActual, mockEsmDefault } = createMockUtils(jest);

const newPrivateKey = {
  id: generateStandardId(),
  value: '-----BEGIN PRIVATE KEY-----\naaaaa\nbbbbb\nccccc\n-----END PRIVATE KEY-----\n',
  createdAt: Math.floor(Date.now() / 1000),
};
const previousPrivateKey = {
  id: generateStandardId(),
  value: '-----BEGIN PRIVATE KEY-----\nlegacy\nprevious\nkey\n-----END PRIVATE KEY-----\n',
  createdAt: Math.floor(Date.now() / 1000) - 10,
};

await mockEsmWithActual('#src/utils/jwks.js', () => ({
  exportJWK: jest.fn(async () => ({ kty: 'EC' })),
}));

await mockEsmWithActual('@logto/cli/lib/commands/database/utils.js', () => ({
  generateOidcCookieKey: jest.fn(),
  generateOidcPrivateKey: jest.fn(async () => newPrivateKey),
}));

mockEsmDefault('node:crypto', () => ({
  createPrivateKey: jest.fn((value) => value),
}));

const logtoConfigQueries = {
  getAdminConsoleConfig: async () => ({ value: mockAdminConsoleData }),
  updateAdminConsoleConfig: async () => ({ value: mockAdminConsoleData }),
  updatePrivateSigningKeysWithLock: jest.fn(),
  updateOidcConfigsByKey: jest.fn(),
};

const logtoConfigLibraries = {
  getOidcConfigs: jest.fn(async () => ({
    [LogtoOidcConfigKey.PrivateKeys]: [
      { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
    ],
    [LogtoOidcConfigKey.CookieKeys]: mockCookieKeys,
  })),
};

const logtoConfigRoutes = await pickDefault(import('./index.js'));

describe('configs routes staged rotation', () => {
  const tenantContext = new MockTenant(undefined, { logtoConfigs: logtoConfigQueries });
  Sinon.stub(tenantContext, 'logtoConfigs').value(logtoConfigLibraries);
  const rotatePrivateSigningKeys = jest.fn();
  Sinon.stub(tenantContext.libraries, 'oidcPrivateKeys').value({
    ...tenantContext.libraries.oidcPrivateKeys,
    rotatePrivateSigningKeys,
  });

  const routeRequester = createRequester({
    authedRoutes: logtoConfigRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /configs/oidc/:keyType/rotate supports staged private-key rotation', async () => {
    rotatePrivateSigningKeys.mockResolvedValueOnce([
      { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
      { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
      { ...previousPrivateKey, status: OidcSigningKeyStatus.Previous },
    ]);

    const response = await routeRequester.post('/configs/oidc/private-keys/rotate').send({
      rotationGracePeriod: 14_400,
    });

    expect(response.status).toEqual(200);
    expect(rotatePrivateSigningKeys).toHaveBeenCalledWith(newPrivateKey, 14_400);
    expect(logtoConfigQueries.updatePrivateSigningKeysWithLock).not.toHaveBeenCalled();
    expect(response.body).toEqual([
      {
        id: newPrivateKey.id,
        createdAt: newPrivateKey.createdAt,
        signingKeyAlgorithm: 'EC',
        status: OidcSigningKeyStatus.Next,
      },
      {
        id: mockPrivateKeys[0]!.id,
        createdAt: mockPrivateKeys[0]!.createdAt,
        signingKeyAlgorithm: 'EC',
        status: OidcSigningKeyStatus.Current,
      },
      {
        id: previousPrivateKey.id,
        createdAt: previousPrivateKey.createdAt,
        signingKeyAlgorithm: 'EC',
        status: OidcSigningKeyStatus.Previous,
      },
    ]);
  });

  it('replaces the staged Next key when rotating with another grace period', async () => {
    const existingPreviousKey = {
      id: generateStandardId(),
      value: '-----BEGIN PRIVATE KEY-----\nold\nprevious\nprivate\n-----END PRIVATE KEY-----\n',
      createdAt: Math.floor(Date.now() / 1000) - 20,
      status: OidcSigningKeyStatus.Previous,
    };
    rotatePrivateSigningKeys.mockResolvedValueOnce([
      { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
      { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
      existingPreviousKey,
    ]);

    await expect(
      routeRequester.post('/configs/oidc/private-keys/rotate').send({
        rotationGracePeriod: 60,
      })
    ).resolves.toHaveProperty('status', 200);

    expect(rotatePrivateSigningKeys).toHaveBeenCalledWith(newPrivateKey, 60);
  });
});
