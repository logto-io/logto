import {
  SupportedSigningKeyAlgorithm,
  type AdminConsoleData,
  LogtoOidcConfigKeyType,
  LogtoJwtTokenKey,
  LogtoJwtTokenKeyType,
} from '@logto/schemas';

import {
  accessTokenJwtCustomizerPayload,
  clientCredentialsJwtCustomizerPayload,
  accessTokenSampleScript,
  clientCredentialsSampleScript,
} from '#src/__mocks__/jwt-customizer.js';
import {
  deleteOidcKey,
  getAdminConsoleConfig,
  getOidcKeys,
  rotateOidcKeys,
  updateAdminConsoleConfig,
  upsertJwtCustomizer,
  updateJwtCustomizer,
  getJwtCustomizer,
  getJwtCustomizers,
  deleteJwtCustomizer,
  testJwtCustomizer,
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
      status: 422,
    });

    const cookieKeys = await getOidcKeys(LogtoOidcConfigKeyType.CookieKeys);
    expect(cookieKeys).toHaveLength(1);
    await expectRejects(deleteOidcKey(LogtoOidcConfigKeyType.CookieKeys, cookieKeys[0]!.id), {
      code: 'oidc.key_required',
      status: 422,
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

  it('should successfully PUT/GET/DELETE a JWT customizer (access token)', async () => {
    await expectRejects(getJwtCustomizer('access-token'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
    await expectRejects(deleteJwtCustomizer('access-token'), {
      code: 'entity.not_found',
      status: 404,
    });
    const accessToken = await upsertJwtCustomizer('access-token', accessTokenJwtCustomizerPayload);
    expect(accessToken).toMatchObject(accessTokenJwtCustomizerPayload);
    const newAccessTokenJwtCustomizerPayload = {
      ...accessTokenJwtCustomizerPayload,
      script: 'new script',
    };
    const updatedAccessToken = await upsertJwtCustomizer(
      'access-token',
      newAccessTokenJwtCustomizerPayload
    );
    expect(updatedAccessToken).toMatchObject(newAccessTokenJwtCustomizerPayload);
    const overwritePayload = { script: 'abc' };
    const updatedValue = await updateJwtCustomizer('access-token', overwritePayload);
    expect(updatedValue).toMatchObject({
      ...newAccessTokenJwtCustomizerPayload,
      script: 'abc',
    });
    await expect(getJwtCustomizer('access-token')).resolves.toMatchObject({
      ...newAccessTokenJwtCustomizerPayload,
      script: 'abc',
    });
    await expect(deleteJwtCustomizer('access-token')).resolves.not.toThrow();
    await expectRejects(getJwtCustomizer('access-token'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should successfully PUT/GET/DELETE a JWT customizer (client credentials)', async () => {
    await expectRejects(getJwtCustomizer('client-credentials'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
    await expectRejects(deleteJwtCustomizer('client-credentials'), {
      code: 'entity.not_found',
      status: 404,
    });
    const clientCredentials = await upsertJwtCustomizer(
      'client-credentials',
      clientCredentialsJwtCustomizerPayload
    );
    expect(clientCredentials).toMatchObject(clientCredentialsJwtCustomizerPayload);
    const newClientCredentialsJwtCustomizerPayload = {
      ...clientCredentialsJwtCustomizerPayload,
      script: 'new script client credentials',
    };
    const updatedClientCredentials = await upsertJwtCustomizer(
      'client-credentials',
      newClientCredentialsJwtCustomizerPayload
    );
    expect(updatedClientCredentials).toMatchObject(newClientCredentialsJwtCustomizerPayload);
    const overwritePayload = { script: 'abc' };
    const updatedValue = await updateJwtCustomizer('client-credentials', overwritePayload);
    expect(updatedValue).toMatchObject({
      ...newClientCredentialsJwtCustomizerPayload,
      script: 'abc',
    });
    await expect(getJwtCustomizer('client-credentials')).resolves.toMatchObject({
      ...newClientCredentialsJwtCustomizerPayload,
      script: 'abc',
    });
    await expect(deleteJwtCustomizer('client-credentials')).resolves.not.toThrow();
    await expectRejects(getJwtCustomizer('client-credentials'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should successfully GET all JWT customizers', async () => {
    await expect(getJwtCustomizers()).resolves.toEqual([]);
    await upsertJwtCustomizer('access-token', accessTokenJwtCustomizerPayload);
    await expect(getJwtCustomizers()).resolves.toEqual([
      {
        key: LogtoJwtTokenKey.AccessToken,
        value: accessTokenJwtCustomizerPayload,
      },
    ]);
    await upsertJwtCustomizer('client-credentials', clientCredentialsJwtCustomizerPayload);
    const jwtCustomizers = await getJwtCustomizers();
    expect(jwtCustomizers).toHaveLength(2);
    expect(jwtCustomizers).toContainEqual({
      key: LogtoJwtTokenKey.AccessToken,
      value: accessTokenJwtCustomizerPayload,
    });
    expect(jwtCustomizers).toContainEqual({
      key: LogtoJwtTokenKey.ClientCredentials,
      value: clientCredentialsJwtCustomizerPayload,
    });
    await deleteJwtCustomizer('access-token');
    await expect(getJwtCustomizers()).resolves.toEqual([
      {
        key: LogtoJwtTokenKey.ClientCredentials,
        value: clientCredentialsJwtCustomizerPayload,
      },
    ]);
    await deleteJwtCustomizer('client-credentials');
    await expect(getJwtCustomizers()).resolves.toEqual([]);
  });

  it('should successfully test an access token JWT customizer', async () => {
    const testResult = await testJwtCustomizer({
      tokenType: LogtoJwtTokenKeyType.AccessToken,
      token: accessTokenJwtCustomizerPayload.tokenSample,
      context: accessTokenJwtCustomizerPayload.contextSample,
      script: accessTokenSampleScript,
      environmentVariables: accessTokenJwtCustomizerPayload.environmentVariables,
    });
    expect(testResult).toMatchObject({
      user_id: accessTokenJwtCustomizerPayload.contextSample.user.id,
    });
  });

  it('should successfully test a client credentials JWT customizer', async () => {
    const testResult = await testJwtCustomizer({
      tokenType: LogtoJwtTokenKeyType.ClientCredentials,
      token: clientCredentialsJwtCustomizerPayload.tokenSample,
      script: clientCredentialsSampleScript,
      environmentVariables: clientCredentialsJwtCustomizerPayload.environmentVariables,
    });
    expect(testResult).toMatchObject(clientCredentialsJwtCustomizerPayload.environmentVariables);
  });
});
