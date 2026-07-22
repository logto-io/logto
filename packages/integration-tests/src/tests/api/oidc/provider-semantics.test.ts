import { randomBytes } from 'node:crypto';

import { ApplicationType, type Application, defaultTenantId } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import { assert, assertEnv, noop } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
import { decodeJwt } from 'jose';
import ky, { HTTPError } from 'ky';

import { oidcApi } from '#src/api/api.js';
import {
  createApplication,
  createApplicationWithSecret,
  deleteApplication,
} from '#src/api/application.js';
import { deleteJwtCustomizer, deleteUser } from '#src/api/index.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername, waitFor } from '#src/utils.js';

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

const expectOidcError = async (
  request: Promise<unknown>,
  expected: { error: string; error_description?: string }
) => {
  const error = await request.catch((error: unknown) => error);
  assert(error instanceof HTTPError, new Error('Expected an OIDC HTTP error'));
  expect(error.response.status).toBe(400);
  await expect(error.response.json()).resolves.toMatchObject(expected);
};

const getHtmlAttribute = (element: string, attribute: string) =>
  new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i').exec(element)?.[1];

describe('opaque user token lifecycle', () => {
  const username = generateUsername();
  const password = generatePassword();
  /* eslint-disable @silverhand/fp/no-let */
  let application: Application;
  let publicApplication: Application;
  let userId = '';
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    await deleteJwtCustomizer('access-token').catch(noop);

    const [createdApplication, createdPublicApplication, user] = await Promise.all([
      createApplicationWithSecret('OIDC provider semantics', ApplicationType.Traditional, {
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
        customClientMetadata: { alwaysIssueRefreshToken: true },
      }),
      /**
       * The provider re-validates client metadata every time it loads a client, and an
       * authorization-code client must carry at least one redirect URI to pass the schema —
       * even when the client only ever calls the revocation endpoint.
       */
      createApplication('OIDC provider semantics public', ApplicationType.SPA, {
        oidcClientMetadata: { redirectUris: [demoAppRedirectUri], postLogoutRedirectUris: [] },
      }),
      createUserByAdmin({ username, password }),
      enableAllPasswordSignInMethods(),
    ]);

    /* eslint-disable @silverhand/fp/no-mutation */
    application = createdApplication;
    publicApplication = createdPublicApplication;
    userId = user.id;
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await Promise.all([
      deleteApplication(application.id),
      deleteApplication(publicApplication.id),
      deleteUser(userId),
    ]);
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

    /**
     * The `offline_access` refresh token is not session-bound (the default `expiresWithSession`
     * policy only binds tokens whose scope lacks `offline_access`), so server-side logout must
     * leave it usable. Pin this before v9 revisits artifact destruction on logout.
     */
    const postLogoutTokenResponse = await oidcApi
      .post('token', {
        headers: { Authorization: getAuthorizationHeader(application) },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      })
      .json<{ access_token: string }>();
    expect(postLogoutTokenResponse.access_token).not.toContain('.');

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

      /* eslint-disable @typescript-eslint/no-unsafe-assignment -- jest `expect.any` is typed as `any` */
      expect(introspection).toEqual({
        active: true,
        client_id: application.id,
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: `${logtoUrl}/oidc`,
        scope: 'openid offline_access profile',
        sub: userId,
        token_type: 'Bearer',
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      /**
       * Since oidc-provider v9 (9.3.0), structured JWTs are rejected at the introspection
       * endpoint with `unsupported_token_type` instead of resolving to `{ active: false }` —
       * JWT access tokens are meant to be verified locally against the JWKS.
       */
      await expectOidcError(introspectToken(application, jwtAccessToken, 'access_token'), {
        error: 'unsupported_token_type',
        error_description:
          'Structured JWT Tokens cannot be introspected via the introspection_endpoint',
      });

      /**
       * Revocation rejects structured JWTs the same way since v9. The previous version answered
       * with a silent 200 no-op, since the full JWT never matched the stored short `jti` key.
       */
      await expectOidcError(revokeToken(application, jwtAccessToken, 'access_token'), {
        error: 'unsupported_token_type',
        error_description: 'Structured JWT Tokens cannot be revoked via the revocation_endpoint',
      });

      /**
       * The default `features.revocation.allowedPolicy` answers a public client presenting
       * another client's token with a 200 without revoking anything, so that valid tokens
       * cannot be guessed through the revocation endpoint.
       */
      const crossClientRevocation = await oidcApi.post('token/revocation', {
        body: new URLSearchParams({
          token: opaqueAccessToken,
          token_type_hint: 'access_token',
          client_id: publicApplication.id,
        }),
      });
      expect(crossClientRevocation.status).toBe(200);
      await expect(
        introspectToken(application, opaqueAccessToken, 'access_token')
      ).resolves.toMatchObject({ active: true });

      await revokeToken(application, opaqueAccessToken, 'access_token');

      await expect(
        introspectToken(application, opaqueAccessToken, 'access_token')
      ).resolves.toEqual({ active: false });

      /**
       * Since oidc-provider v9, revoking an access token also revokes the sibling tokens of
       * the same grant (RFC 7009 §2.1: the server "MAY revoke the respective refresh token"),
       * so the sibling refresh token becomes unusable. The previous version only cascaded when
       * a refresh token was revoked. Logto SDKs only revoke refresh tokens on sign-out, so no
       * client flow relies on the old behavior.
       */
      await expectOidcError(
        oidcApi.post('token', {
          headers: { Authorization: getAuthorizationHeader(application) },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        }),
        { error: 'invalid_grant' }
      );
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
      createApplicationWithSecret('Opaque client credentials', ApplicationType.MachineToMachine),
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

    /**
     * Logto issues M2M API tokens as JWTs, so opaque ClientCredentials tokens cannot be minted
     * through the public endpoints. Seed the model shape directly instead, mirroring what the
     * opaque format persists in v8: `iat` and `exp` plus the defined `IN_PAYLOAD` fields (`jti`,
     * `kind`, `clientId`; `aud`/`scope`/`extra` are omitted when undefined). If this test fails
     * after the v9 switch, first diff this seed against the new `IN_PAYLOAD` list — a mismatch
     * there is a seeding-shape issue, not a revocation semantics change.
     */
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

describe('refresh token rotation and reuse detection', () => {
  const username = generateUsername();
  const password = generatePassword();
  /* eslint-disable @silverhand/fp/no-let */
  let application: Application;
  let userId = '';
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    const [createdApplication, user] = await Promise.all([
      createApplication('OIDC refresh token rotation', ApplicationType.SPA, {
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
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

  it('rotates public-client refresh tokens and revokes the whole grant on reuse', async () => {
    const client = await initExperienceClient({
      config: { appId: application.id },
      redirectUri: demoAppRedirectUri,
    });
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await expect(processSession(client, redirectTo)).resolves.toBe(userId);

    const initialRefreshToken = await client.getRefreshToken();
    assert(initialRefreshToken, new Error('Missing refresh token after code exchange'));

    const exchangeRefreshToken = async (refreshToken: string) =>
      oidcApi
        .post('token', {
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: application.id,
          }),
        })
        .json<{ refresh_token: string; id_token: string }>();

    /**
     * The default `rotateRefreshToken` policy rotates on every use for public clients whose
     * refresh tokens are not sender-constrained, marking the presented token as consumed.
     */
    const rotated = await exchangeRefreshToken(initialRefreshToken);
    expect(rotated.refresh_token).toBeTruthy();
    expect(rotated.refresh_token).not.toBe(initialRefreshToken);

    /**
     * Since v9 the token endpoint no longer sets `at_hash` on ID tokens: the claim only guards
     * against front-channel token substitution, so it protects nothing on this response. The
     * official SDK sweep confirmed no SDK reads it.
     */
    expect(decodeJwt(rotated.id_token)).not.toHaveProperty('at_hash');

    /**
     * Logto's adapter keeps a hard-coded 3-second leeway after a rotation, during which the
     * consumed refresh token still refreshes successfully, so that concurrent refreshes from
     * distributed apps without shared token storage (e.g. serverless) do not race each other
     * out of the session.
     */
    const leewayReplay = await exchangeRefreshToken(initialRefreshToken);
    expect(leewayReplay.refresh_token).toBeTruthy();

    /**
     * Past the leeway, presenting a consumed refresh token is treated as reuse: the provider
     * destroys the token and revokes the whole grant, so the freshest rotated replacement dies
     * with it.
     */
    await waitFor(4000);
    await expectOidcError(exchangeRefreshToken(initialRefreshToken), { error: 'invalid_grant' });
    await expectOidcError(exchangeRefreshToken(leewayReplay.refresh_token), {
      error: 'invalid_grant',
    });
  });
});
