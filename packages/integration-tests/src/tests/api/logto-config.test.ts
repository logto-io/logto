import {
  SupportedSigningKeyAlgorithm,
  type AdminConsoleData,
  LogtoOidcConfigKeyType,
  LogtoJwtTokenKeyType,
} from '@logto/schemas';

import {
  deleteOidcKey,
  getAdminConsoleConfig,
  getOidcKeys,
  rotateOidcKeys,
  updateAdminConsoleConfig,
  insertOrUpdateJwtCustomizer,
} from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';

const defaultAdminConsoleConfig: AdminConsoleData = {
  signInExperienceCustomized: false,
  organizationCreated: false,
};

describe('admin console sign-in experience', () => {
  it('should get admin console config successfully', async () => {
    const adminConsoleConfig = await getAdminConsoleConfig();

    expect(adminConsoleConfig).toBeTruthy();
  });

  it('should update admin console config successfully', async () => {
    const newAdminConsoleConfig = {
      signInExperienceCustomized: true,
    };

    const updatedAdminConsoleConfig = await updateAdminConsoleConfig(newAdminConsoleConfig);
    expect(updatedAdminConsoleConfig).toMatchObject({
      ...defaultAdminConsoleConfig,
      ...newAdminConsoleConfig,
    });
  });

  it('should get OIDC keys successfully', async () => {
    const privateKeys = await getOidcKeys(LogtoOidcConfigKeyType.PrivateKeys);
    const cookieKeys = await getOidcKeys(LogtoOidcConfigKeyType.CookieKeys);

    expect(privateKeys).toHaveLength(1);
    expect(privateKeys[0]).toMatchObject(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'EC', createdAt: expect.any(Number) }
    );
    expect(cookieKeys).toHaveLength(1);
    expect(cookieKeys[0]).toMatchObject(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), createdAt: expect.any(Number) }
    );
  });

  it('should not be able to delete the only private key', async () => {
    const privateKeys = await getOidcKeys(LogtoOidcConfigKeyType.PrivateKeys);
    expect(privateKeys).toHaveLength(1);
    await expectRejects(deleteOidcKey(LogtoOidcConfigKeyType.PrivateKeys, privateKeys[0]!.id), {
      code: 'oidc.key_required',
      statusCode: 422,
    });

    const cookieKeys = await getOidcKeys(LogtoOidcConfigKeyType.CookieKeys);
    expect(cookieKeys).toHaveLength(1);
    await expectRejects(deleteOidcKey(LogtoOidcConfigKeyType.CookieKeys, cookieKeys[0]!.id), {
      code: 'oidc.key_required',
      statusCode: 422,
    });
  });

  it('should rotate OIDC keys successfully', async () => {
    const existingPrivateKeys = await getOidcKeys(LogtoOidcConfigKeyType.PrivateKeys);
    const newPrivateKeys = await rotateOidcKeys(
      LogtoOidcConfigKeyType.PrivateKeys,
      SupportedSigningKeyAlgorithm.RSA
    );

    expect(newPrivateKeys).toHaveLength(2);
    expect(newPrivateKeys).toMatchObject([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'RSA', createdAt: expect.any(Number) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'EC', createdAt: expect.any(Number) },
    ]);
    expect(newPrivateKeys[1]?.id).toBe(existingPrivateKeys[0]?.id);

    const existingCookieKeys = await getOidcKeys(LogtoOidcConfigKeyType.CookieKeys);
    const newCookieKeys = await rotateOidcKeys(LogtoOidcConfigKeyType.CookieKeys);

    expect(newCookieKeys).toHaveLength(2);
    expect(newCookieKeys).toMatchObject([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), createdAt: expect.any(Number) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), createdAt: expect.any(Number) },
    ]);
    expect(newCookieKeys[1]?.id).toBe(existingCookieKeys[0]?.id);
  });

  it('should only keep 2 recent OIDC keys', async () => {
    const privateKeys = await rotateOidcKeys(LogtoOidcConfigKeyType.PrivateKeys); // Defaults to 'EC' algorithm

    expect(privateKeys).toHaveLength(2);
    expect(privateKeys).toMatchObject([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'EC', createdAt: expect.any(Number) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'RSA', createdAt: expect.any(Number) },
    ]);

    const privateKeys2 = await rotateOidcKeys(
      LogtoOidcConfigKeyType.PrivateKeys,
      SupportedSigningKeyAlgorithm.RSA
    );

    expect(privateKeys2).toHaveLength(2);
    expect(privateKeys2).toMatchObject([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'RSA', createdAt: expect.any(Number) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'EC', createdAt: expect.any(Number) },
    ]);
    expect(privateKeys2[1]?.id).toBe(privateKeys[0]?.id);
  });

  it('should successfully add a new JWT customizer', async () => {
    const accessTokenJwtCustomizerPayload = {
      script: '',
      envVars: {},
      contextSample: {
        user: {
          username: 'test',
          id: 'fake-id',
        },
      },
    };
    const clientCredentialsJwtCustomizerPayload = {
      ...accessTokenJwtCustomizerPayload,
      contextSample: {},
    };

    const accessToken = await insertOrUpdateJwtCustomizer(
      LogtoJwtTokenKeyType.AccessToken,
      accessTokenJwtCustomizerPayload
    );
    expect(accessToken).toMatchObject(accessTokenJwtCustomizerPayload);
    const newAccessTokenJwtCustomizerPayload = {
      ...accessTokenJwtCustomizerPayload,
      script: 'new script',
    };
    const updatedAccessToken = await insertOrUpdateJwtCustomizer(
      LogtoJwtTokenKeyType.AccessToken,
      newAccessTokenJwtCustomizerPayload
    );
    expect(updatedAccessToken).toMatchObject(newAccessTokenJwtCustomizerPayload);

    const clientCredentials = await insertOrUpdateJwtCustomizer(
      LogtoJwtTokenKeyType.ClientCredentials,
      clientCredentialsJwtCustomizerPayload
    );
    expect(clientCredentials).toMatchObject(clientCredentialsJwtCustomizerPayload);
    const newClientCredentialsJwtCustomizerPayload = {
      ...clientCredentialsJwtCustomizerPayload,
      script: 'new script client credentials',
    };
    const updatedClientCredentials = await insertOrUpdateJwtCustomizer(
      LogtoJwtTokenKeyType.ClientCredentials,
      newClientCredentialsJwtCustomizerPayload
    );
    expect(updatedClientCredentials).toMatchObject(newClientCredentialsJwtCustomizerPayload);
  });
});
