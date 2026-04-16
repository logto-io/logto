import { LogtoOidcConfigKey, OidcSigningKeyStatus, type AdminConsoleData } from '@logto/schemas';
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
const newCookieKey = {
  id: generateStandardId(),
  value: 'abcdefg',
  createdAt: Math.floor(Date.now() / 1000),
};
const previousPrivateKey = {
  id: generateStandardId(),
  value: '-----BEGIN PRIVATE KEY-----\nlegacy\nprevious\nkey\n-----END PRIVATE KEY-----\n',
  createdAt: Math.floor(Date.now() / 1000) - 10,
};

const { exportJWK } = await mockEsmWithActual('#src/utils/jwks.js', () => ({
  exportJWK: jest.fn(async () => ({ kty: 'EC' })),
}));

const { generateOidcPrivateKey } = await mockEsmWithActual(
  '@logto/cli/lib/commands/database/utils.js',
  () => ({
    generateOidcCookieKey: jest.fn(() => newCookieKey),
    generateOidcPrivateKey: jest.fn(async () => newPrivateKey),
  })
);

mockEsmDefault('node:crypto', () => ({
  createPrivateKey: jest.fn((value) => value),
}));

const logtoConfigQueries = {
  getAdminConsoleConfig: async () => ({ value: mockAdminConsoleData }),
  updateAdminConsoleConfig: async (data: Partial<AdminConsoleData>) => ({
    value: {
      ...mockAdminConsoleData,
      ...data,
    },
  }),
  updatePrivateSigningKeys: jest.fn(),
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

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs routes', () => {
  const tenantContext = new MockTenant(undefined, { logtoConfigs: logtoConfigQueries });
  Sinon.stub(tenantContext, 'logtoConfigs').value(logtoConfigLibraries);

  const routeRequester = createRequester({
    authedRoutes: settingRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /configs/admin-console', async () => {
    const response = await routeRequester.get('/configs/admin-console');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockAdminConsoleData);
  });

  it('PATCH /configs/admin-console', async () => {
    const signInExperienceCustomized = !mockAdminConsoleData.signInExperienceCustomized;
    const response = await routeRequester
      .patch('/configs/admin-console')
      .send({ signInExperienceCustomized });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockAdminConsoleData,
      signInExperienceCustomized,
    });
  });

  it('GET /configs/oidc/:keyType', async () => {
    const response = await routeRequester.get('/configs/oidc/private-keys');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      [{ ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current }].map(
        ({ id, createdAt, status }) => ({
          id,
          createdAt,
          signingKeyAlgorithm: 'EC',
          status,
        })
      )
    );

    const response2 = await routeRequester.get('/configs/oidc/cookie-keys');
    expect(response2.status).toEqual(200);
    expect(response2.body).toEqual(
      mockCookieKeys.map(({ id, createdAt }) => ({
        id,
        createdAt,
      }))
    );
  });

  it('DELETE /configs/oidc/:keyType/:keyId will fail if there is only one key', async () => {
    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${mockPrivateKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 422);

    expect(logtoConfigQueries.updatePrivateSigningKeys).not.toBeCalled();
    expect(logtoConfigQueries.updateOidcConfigsByKey).not.toBeCalled();
  });

  it('DELETE /configs/oidc/:keyType/:keyId', async () => {
    logtoConfigLibraries.getOidcConfigs.mockResolvedValue({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
        { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Previous },
      ],
      [LogtoOidcConfigKey.CookieKeys]: [newCookieKey, ...mockCookieKeys],
    });

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${mockPrivateKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 204);

    expect(logtoConfigQueries.updatePrivateSigningKeys).toBeCalledWith([
      { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
    ]);

    await expect(
      routeRequester.delete(`/configs/oidc/cookie-keys/${mockCookieKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 204);

    expect(logtoConfigQueries.updateOidcConfigsByKey).toBeCalledWith(
      LogtoOidcConfigKey.CookieKeys,
      [newCookieKey]
    );

    logtoConfigLibraries.getOidcConfigs.mockRestore();
  });

  it('DELETE /configs/oidc/:keyType/:keyId will fail if key is not found', async () => {
    logtoConfigLibraries.getOidcConfigs.mockResolvedValue({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
        { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Previous },
      ],
      [LogtoOidcConfigKey.CookieKeys]: [newCookieKey, ...mockCookieKeys],
    });

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/fake_key_id`)
    ).resolves.toHaveProperty('status', 404);

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/fake_key_id`)
    ).resolves.toHaveProperty('status', 404);

    expect(logtoConfigQueries.updatePrivateSigningKeys).not.toBeCalled();
    expect(logtoConfigQueries.updateOidcConfigsByKey).not.toBeCalled();
    logtoConfigLibraries.getOidcConfigs.mockRestore();
  });

  it('DELETE /configs/oidc/:keyType/:keyId only allows deleting Previous private keys', async () => {
    logtoConfigLibraries.getOidcConfigs.mockResolvedValue({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
        { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Previous },
      ],
      [LogtoOidcConfigKey.CookieKeys]: mockCookieKeys,
    });

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${newPrivateKey.id}`)
    ).resolves.toHaveProperty('status', 422);

    expect(logtoConfigQueries.updatePrivateSigningKeys).not.toBeCalled();
    expect(logtoConfigQueries.updateOidcConfigsByKey).not.toBeCalled();
    logtoConfigLibraries.getOidcConfigs.mockRestore();
  });

  it('DELETE /configs/oidc/:keyType/:keyId preserves staged Next and Current private keys', async () => {
    logtoConfigLibraries.getOidcConfigs.mockResolvedValue({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
        { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
        { ...previousPrivateKey, status: OidcSigningKeyStatus.Previous },
      ],
      [LogtoOidcConfigKey.CookieKeys]: mockCookieKeys,
    });

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${previousPrivateKey.id}`)
    ).resolves.toHaveProperty('status', 204);

    expect(logtoConfigQueries.updatePrivateSigningKeys).toBeCalledWith([
      { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
      { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
    ]);

    logtoConfigLibraries.getOidcConfigs.mockRestore();
  });

  it('POST /configs/oidc/:keyType/rotate', async () => {
    logtoConfigLibraries.getOidcConfigs.mockResolvedValue({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
      ],
      [LogtoOidcConfigKey.CookieKeys]: mockCookieKeys,
    });
    exportJWK.mockResolvedValueOnce({ kty: 'RSA' });

    const response = await routeRequester.post('/configs/oidc/private-keys/rotate');
    expect(response.status).toEqual(200);
    expect(logtoConfigQueries.updatePrivateSigningKeys).toHaveBeenCalledWith([
      { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
      { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Previous },
    ]);
    expect(response.body[0]).toEqual({
      id: newPrivateKey.id,
      createdAt: newPrivateKey.createdAt,
      signingKeyAlgorithm: 'RSA',
      status: OidcSigningKeyStatus.Current,
    });

    const response2 = await routeRequester.post('/configs/oidc/cookie-keys/rotate');
    expect(response2.status).toEqual(200);
    expect(logtoConfigQueries.updateOidcConfigsByKey).toHaveBeenCalledWith(
      LogtoOidcConfigKey.CookieKeys,
      [newCookieKey, ...mockCookieKeys]
    );
    expect(response2.body[0]).toEqual({
      id: newCookieKey.id,
      createdAt: newCookieKey.createdAt,
    });
    logtoConfigLibraries.getOidcConfigs.mockRestore();
  });

  it('keeps the immediate rotation flow at 2 private keys', async () => {
    logtoConfigLibraries.getOidcConfigs.mockResolvedValueOnce({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
        { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Previous },
      ],
      [LogtoOidcConfigKey.CookieKeys]: [newCookieKey, ...mockCookieKeys],
    });

    const newPrivateKey2 = {
      id: generateStandardId(),
      value: '-----BEGIN PRIVATE KEY-----\nnew\nprivate\nkey\n-----END PRIVATE KEY-----\n',
      createdAt: Math.floor(Date.now() / 1000),
    };
    generateOidcPrivateKey.mockResolvedValueOnce(newPrivateKey2);

    await routeRequester.post('/configs/oidc/private-keys/rotate');

    // Only has two keys and the original mocked private keys are clamped off
    expect(logtoConfigQueries.updatePrivateSigningKeys).toHaveBeenCalledWith([
      { ...newPrivateKey2, status: OidcSigningKeyStatus.Current },
      { ...newPrivateKey, status: OidcSigningKeyStatus.Previous },
    ]);
  });

  it('rejects immediate private-key rotation when a staged Next key already exists', async () => {
    logtoConfigLibraries.getOidcConfigs.mockResolvedValueOnce({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
        { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
        { ...previousPrivateKey, status: OidcSigningKeyStatus.Previous },
      ],
      [LogtoOidcConfigKey.CookieKeys]: mockCookieKeys,
    });

    await expect(routeRequester.post('/configs/oidc/private-keys/rotate')).resolves.toHaveProperty(
      'status',
      422
    );

    expect(logtoConfigQueries.updatePrivateSigningKeys).not.toHaveBeenCalled();
  });
});
