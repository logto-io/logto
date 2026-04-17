import { LogtoOidcConfigKey, OidcSigningKeyStatus, type AdminConsoleData } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import Sinon from 'sinon';

import { mockAdminConsoleData, mockCookieKeys, mockPrivateKeys } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
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

const oidcPrivateKeyLibraries = {
  deletePrivateSigningKey: jest.fn(async () => [
    { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
  ]),
  stagePrivateSigningKeyRotation: jest.fn(async () => [
    { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
    { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
  ]),
  rotatePrivateSigningKeys: jest.fn(async () => [
    { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
    { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Previous },
  ]),
};

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs routes', () => {
  const tenantContext = new MockTenant(undefined, { logtoConfigs: logtoConfigQueries }, undefined, {
    oidcPrivateKeys: oidcPrivateKeyLibraries,
  });
  Sinon.stub(tenantContext, 'logtoConfigs').value(logtoConfigLibraries);
  Sinon.stub(tenantContext.libraries, 'oidcPrivateKeys').value(oidcPrivateKeyLibraries);

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
    oidcPrivateKeyLibraries.deletePrivateSigningKey.mockRejectedValueOnce(
      new RequestError({ code: 'oidc.key_required', status: 422 })
    );

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${mockPrivateKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 422);

    expect(oidcPrivateKeyLibraries.deletePrivateSigningKey).toBeCalled();
    expect(logtoConfigQueries.updateOidcConfigsByKey).not.toBeCalled();
  });

  it('DELETE /configs/oidc/:keyType/:keyId', async () => {
    oidcPrivateKeyLibraries.deletePrivateSigningKey.mockResolvedValueOnce([
      { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
    ]);
    logtoConfigLibraries.getOidcConfigs.mockResolvedValueOnce({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
      ],
      [LogtoOidcConfigKey.CookieKeys]: [newCookieKey, ...mockCookieKeys],
    });

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${mockPrivateKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 204);

    expect(oidcPrivateKeyLibraries.deletePrivateSigningKey).toBeCalledWith(mockPrivateKeys[0]!.id);

    await expect(
      routeRequester.delete(`/configs/oidc/cookie-keys/${mockCookieKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 204);

    expect(logtoConfigQueries.updateOidcConfigsByKey).toBeCalledWith(
      LogtoOidcConfigKey.CookieKeys,
      [newCookieKey]
    );
  });

  it('DELETE /configs/oidc/:keyType/:keyId will fail if key is not found', async () => {
    oidcPrivateKeyLibraries.deletePrivateSigningKey
      .mockRejectedValueOnce(
        new RequestError({ code: 'oidc.key_not_found', id: 'fake_key_id', status: 404 })
      )
      .mockRejectedValueOnce(
        new RequestError({ code: 'oidc.key_not_found', id: 'fake_key_id', status: 404 })
      );

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/fake_key_id`)
    ).resolves.toHaveProperty('status', 404);

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/fake_key_id`)
    ).resolves.toHaveProperty('status', 404);

    expect(oidcPrivateKeyLibraries.deletePrivateSigningKey).toBeCalled();
    expect(logtoConfigQueries.updateOidcConfigsByKey).not.toBeCalled();
  });

  it('DELETE /configs/oidc/:keyType/:keyId only allows deleting Previous private keys', async () => {
    oidcPrivateKeyLibraries.deletePrivateSigningKey.mockRejectedValueOnce(
      new RequestError({ code: 'oidc.only_previous_key_can_be_deleted', status: 422 })
    );

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${newPrivateKey.id}`)
    ).resolves.toHaveProperty('status', 422);

    expect(oidcPrivateKeyLibraries.deletePrivateSigningKey).toBeCalledWith(newPrivateKey.id);
    expect(logtoConfigQueries.updateOidcConfigsByKey).not.toBeCalled();
  });

  it('DELETE /configs/oidc/:keyType/:keyId preserves staged Next and Current private keys', async () => {
    oidcPrivateKeyLibraries.deletePrivateSigningKey.mockResolvedValueOnce([
      { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
      { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
    ]);

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${previousPrivateKey.id}`)
    ).resolves.toHaveProperty('status', 204);

    expect(oidcPrivateKeyLibraries.deletePrivateSigningKey).toBeCalledWith(previousPrivateKey.id);
  });

  it('POST /configs/oidc/:keyType/rotate', async () => {
    logtoConfigLibraries.getOidcConfigs.mockResolvedValueOnce({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { ...mockPrivateKeys[0]!, status: OidcSigningKeyStatus.Current },
      ],
      [LogtoOidcConfigKey.CookieKeys]: mockCookieKeys,
    });
    exportJWK.mockResolvedValueOnce({ kty: 'RSA' });

    const response = await routeRequester.post('/configs/oidc/private-keys/rotate');
    expect(response.status).toEqual(200);
    expect(oidcPrivateKeyLibraries.rotatePrivateSigningKeys).toHaveBeenCalledWith(newPrivateKey);
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
  });

  it('keeps the immediate rotation flow at 2 private keys', async () => {
    const newPrivateKey2 = {
      id: generateStandardId(),
      value: '-----BEGIN PRIVATE KEY-----\nnew\nprivate\nkey\n-----END PRIVATE KEY-----\n',
      createdAt: Math.floor(Date.now() / 1000),
    };
    oidcPrivateKeyLibraries.rotatePrivateSigningKeys.mockResolvedValueOnce([
      { ...newPrivateKey2, status: OidcSigningKeyStatus.Current },
      { ...newPrivateKey, status: OidcSigningKeyStatus.Previous },
    ]);
    generateOidcPrivateKey.mockResolvedValueOnce(newPrivateKey2);

    await routeRequester.post('/configs/oidc/private-keys/rotate');

    expect(oidcPrivateKeyLibraries.rotatePrivateSigningKeys).toHaveBeenCalledWith(newPrivateKey2);
  });

  it('rejects immediate private-key rotation when a staged Next key already exists', async () => {
    oidcPrivateKeyLibraries.rotatePrivateSigningKeys.mockRejectedValueOnce(
      new RequestError({ code: 'oidc.invalid_request', status: 422 })
    );

    await expect(routeRequester.post('/configs/oidc/private-keys/rotate')).resolves.toHaveProperty(
      'status',
      422
    );

    expect(oidcPrivateKeyLibraries.rotatePrivateSigningKeys).toHaveBeenCalledWith(newPrivateKey);
  });

  it('POST /configs/oidc/:keyType/rotate supports staged private-key rotation', async () => {
    exportJWK.mockResolvedValueOnce({ kty: 'RSA' });

    const response = await routeRequester
      .post('/configs/oidc/private-keys/rotate')
      .send({ rotationGracePeriod: 60 });

    expect(response.status).toEqual(200);
    expect(oidcPrivateKeyLibraries.stagePrivateSigningKeyRotation).toHaveBeenCalledWith(
      newPrivateKey,
      60
    );
    expect(oidcPrivateKeyLibraries.rotatePrivateSigningKeys).not.toHaveBeenCalled();
    expect(response.body[0]).toEqual({
      id: newPrivateKey.id,
      createdAt: newPrivateKey.createdAt,
      signingKeyAlgorithm: 'RSA',
      status: OidcSigningKeyStatus.Next,
    });
  });
});
