import { randomBytes } from 'node:crypto';

import { ApplicationType, type Application, defaultTenantId } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import { assert, assertEnv, noop } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
import ky from 'ky';

import { oidcApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { deleteJwtCustomizer, deleteUser } from '#src/api/index.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

type IntrospectionResponse = {
  [key: string]: unknown;
  active: boolean;
};

const getAuthorizationHeader = ({ id, secret }: Application) =>
  `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;

const introspectToken = async (application: Application, token: string, tokenType: string) =>
  oidcApi
    .post('token/introspection', {
      headers: { Authorization: getAuthorizationHeader(application) },
      body: new URLSearchParams({ token, token_type_hint: tokenType }),
    })
    .json<IntrospectionResponse>();

const revokeToken = async (application: Application, token: string, tokenType: string) =>
  oidcApi.post('token/revocation', {
    headers: { Authorization: getAuthorizationHeader(application) },
    body: new URLSearchParams({ token, token_type_hint: tokenType }),
  });

const getHtmlAttribute = (element: string, attribute: string) =>
  new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i').exec(element)?.[1];

describe('opaque user token lifecycle', () => {
  const username = generateUsername();
  const password = generatePassword();
  /* eslint-disable @silverhand/fp/no-let */
  let application: Application;
  let userId = '';
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    await deleteJwtCustomizer('access-token').catch(noop);

    const [createdApplication, user] = await Promise.all([
      createApplication('OIDC provider semantics', ApplicationType.Traditional, {
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
        customClientMetadata: { alwaysIssueRefreshToken: true },
      }),
      createUserByAdmin({ username, password }),
      enableAllPasswordSignInMethods(),
    ]);

    /* eslint-disable @silverhand/fp/no-mutation */
    application = createdApplication;
    userId = user.id;
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await Promise.all([deleteApplication(application.id), deleteUser(userId)]);
  });

  const signIn = async (resources?: string[]) => {
    const client = await initExperienceClient({
      config: {
        appId: application.id,
        appSecret: application.secret,
        resources,
      },
      redirectUri: demoAppRedirectUri,
    });
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await expect(processSession(client, redirectTo)).resolves.toBe(userId);

    return client;
  };

  it('round-trips opaque artifacts through authorization code, refresh, and logout', async () => {
    const client = await signIn();
    const authorizationCodeRefreshToken = await client.getRefreshToken();
    assert(authorizationCodeRefreshToken, new Error('Missing refresh token after code exchange'));

    await client.clearAccessToken();
    const accessToken = await client.getAccessToken();
    const refreshToken = await client.getRefreshToken();
    assert(refreshToken, new Error('Missing refresh token after refresh grant'));

    expect(accessToken).not.toContain('.');
    expect(accessToken.length).toBeGreaterThanOrEqual(43);
    expect(authorizationCodeRefreshToken).not.toContain('.');
    expect(authorizationCodeRefreshToken.length).toBeGreaterThanOrEqual(43);
    expect(refreshToken).not.toContain('.');
    expect(refreshToken.length).toBeGreaterThanOrEqual(43);

    const endSessionUrl = new URL('/oidc/session/end', logtoUrl);
    const confirmationResponse = await ky.get(endSessionUrl, {
      headers: { cookie: client.getCookieHeader(endSessionUrl.pathname) },
      redirect: 'manual',
    });
    const confirmationPage = await confirmationResponse.text();
    const form = /<form\b[^>]*id=["']op\.logoutform["'][^>]*>/i.exec(confirmationPage)?.[0];
    assert(form, new Error('Missing logout confirmation form'));
    const action = getHtmlAttribute(form, 'action');
    const xsrfInput = /<input\b[^>]*name=["']xsrf["'][^>]*>/i.exec(confirmationPage)?.[0];
    const xsrf = xsrfInput && getHtmlAttribute(xsrfInput, 'value');
    assert(action && xsrf, new Error('Missing logout confirmation form values'));

    client.mergeRawCookies(confirmationResponse.headers.getSetCookie());
    const confirmationUrl = new URL(action, logtoUrl);
    const logoutResponse = await ky.post(confirmationUrl, {
      body: new URLSearchParams({ logout: 'yes', xsrf }),
      headers: {
        ...formUrlEncodedHeaders,
        cookie: client.getCookieHeader(confirmationUrl.pathname),
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });

    expect(logoutResponse.status).toBe(303);
    await logoutClient(client);
  });

  it('pins opaque and JWT introspection plus access-token revocation semantics', async () => {
    const resource = await createResource();

    try {
      const client = await signIn([resource.indicator]);
      await client.clearAccessToken();
      const opaqueAccessToken = await client.getAccessToken();
      const jwtAccessToken = await client.getAccessToken(resource.indicator);
      const refreshToken = await client.getRefreshToken();
      assert(refreshToken, new Error('Missing sibling refresh token'));

      const introspection = await introspectToken(application, opaqueAccessToken, 'access_token');

      expect(Object.keys(introspection).toSorted()).toEqual([
        'active',
        'client_id',
        'exp',
        'iat',
        'iss',
        'scope',
        'sub',
        'token_type',
      ]);
      expect(introspection).toEqual({
        active: true,
        client_id: application.id,
        exp: introspection.exp,
        iat: introspection.iat,
        iss: `${logtoUrl}/oidc`,
        scope: 'openid offline_access profile',
        sub: userId,
        token_type: 'Bearer',
      });
      expect(typeof introspection.exp).toBe('number');
      expect(typeof introspection.iat).toBe('number');
      await expect(introspectToken(application, jwtAccessToken, 'access_token')).resolves.toEqual({
        active: false,
      });

      await revokeToken(application, opaqueAccessToken, 'access_token');

      await expect(
        introspectToken(application, opaqueAccessToken, 'access_token')
      ).resolves.toEqual({ active: false });
      await expect(
        oidcApi.post('token', {
          headers: { Authorization: getAuthorizationHeader(application) },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        })
      ).resolves.toBeDefined();
    } finally {
      await deleteResource(resource.id);
    }
  });
});

describe('opaque client-credentials revocation', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let application: Application;
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    [application, pool] = await Promise.all([
      createApplication('Opaque client credentials', ApplicationType.MachineToMachine),
      createPool(assertEnv('DB_URL'), { interceptors: createInterceptorsPreset() }),
    ]);
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await Promise.all([deleteApplication(application.id), pool.end()]);
  });

  it('destroys only the requested token', async () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 3600;
    const tokens = [
      randomBytes(32).toString('base64url'),
      randomBytes(32).toString('base64url'),
    ] as const;
    const payload = {
      clientId: application.id,
      exp: expiresAt,
      iat: issuedAt,
      kind: 'ClientCredentials',
    };

    // Logto issues M2M API tokens as JWTs. Seed oidc-provider's opaque ClientCredentials model
    // shape directly so its revocation behavior can still be exercised through the public endpoint.
    await pool.query(sql`
      insert into oidc_model_instances (tenant_id, model_name, id, payload, expires_at)
      values
        (${defaultTenantId}, 'ClientCredentials', ${tokens[0]}, ${sql.jsonb({ ...payload, jti: tokens[0] })}, to_timestamp(${expiresAt})),
        (${defaultTenantId}, 'ClientCredentials', ${tokens[1]}, ${sql.jsonb({ ...payload, jti: tokens[1] })}, to_timestamp(${expiresAt}))
    `);

    try {
      await expect(
        introspectToken(application, tokens[0], 'client_credentials')
      ).resolves.toMatchObject({ active: true, client_id: application.id });
      await expect(
        introspectToken(application, tokens[1], 'client_credentials')
      ).resolves.toMatchObject({ active: true, client_id: application.id });

      await revokeToken(application, tokens[0], 'client_credentials');

      await expect(introspectToken(application, tokens[0], 'client_credentials')).resolves.toEqual({
        active: false,
      });
      await expect(
        introspectToken(application, tokens[1], 'client_credentials')
      ).resolves.toMatchObject({ active: true, client_id: application.id });
    } finally {
      await pool.query(sql`
        delete from oidc_model_instances
        where tenant_id = ${defaultTenantId} and id in (${sql.join(tokens, sql`, `)})
      `);
    }
  });
});
