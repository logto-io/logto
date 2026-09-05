import { setTimeout } from 'node:timers/promises';

import { Prompt } from '@logto/node';
import { GrantType, InteractionEvent, defaultTenantId, demoAppApplicationId } from '@logto/schemas';
import { assert, assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
import { decodeJwt } from 'jose';

import { accessTokenJwtCustomizerPayload } from '#src/__mocks__/jwt-customizer.js';
import { oidcApi } from '#src/api/api.js';
import { deleteJwtCustomizer, upsertJwtCustomizer } from '#src/api/index.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { demoAppRedirectUri, isDevFeaturesEnabled } from '#src/constants.js';
import { logoutClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  enableAllPasswordSignInMethods,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

class ResourceExperienceClient extends ExperienceClient {
  constructor(resource?: string) {
    super({
      appId: demoAppApplicationId,
      prompt: Prompt.Consent,
      scopes: ['offline_access'],
      resources: resource ? [resource] : [],
    });

    if (resource) {
      // The SDK omits `resource` during code exchange. Add it to that request to cover
      // JWT issuance from the authorization code without first using a refresh token.
      const { requester } = this.logto.adapter;

      this.logto.adapter.requester = async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
        const [url, options] = args;
        if (typeof options?.body !== 'string') {
          return requester<T>(...args);
        }
        const body = new URLSearchParams(options.body);
        if (body.get('grant_type') !== GrantType.AuthorizationCode) {
          return requester<T>(...args);
        }

        return requester<T>(url, {
          ...options,
          body: new URLSearchParams([...body, ['resource', resource]]).toString(),
        });
      };
    }
  }
}

const introspectToken = async (token: string) =>
  oidcApi
    .post('token/introspection', {
      body: new URLSearchParams({
        client_id: demoAppApplicationId,
        token,
        token_type_hint: 'access_token',
      }),
    })
    .json<Record<string, unknown>>();

const refreshTokens = async (refreshToken: string, resource?: string) =>
  oidcApi
    .post('token', {
      body: new URLSearchParams({
        grant_type: GrantType.RefreshToken,
        client_id: demoAppApplicationId,
        refresh_token: refreshToken,
        ...(resource && { resource }),
      }),
    })
    .json<TokenResponse>();

describe('authentication context in access tokens', () => {
  const userApi = new UserApiTest();
  const profile = generateNewUserProfile({ username: true, password: true });
  // eslint-disable-next-line @silverhand/fp/no-let -- The database connection is shared by the fixture and assertions.
  let pool: DatabasePool;

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
    await userApi.create(profile);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Initialize the connection after Jest has loaded the test environment.
    pool = await createPool(assertEnv('DB_URL'), { interceptors: createInterceptorsPreset() });
  });

  afterAll(async () => {
    await resetMfaSettings();
    await userApi.cleanUp();
    await pool.end();
  });

  const signIn = async (resource?: string) => {
    const client = new ResourceExperienceClient(resource);
    await client.initSession(demoAppRedirectUri);
    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
    await identifyUserWithUsernamePassword(client, profile.username, profile.password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    return client;
  };

  it.each(['opaque', 'jwt'] as const)(
    'preserves the authorization context in %s tokens through refresh rotation',
    async (format) => {
      const resource = format === 'jwt' ? await createResource() : undefined;

      try {
        const client = await signIn(resource?.indicator);
        const idTokenClaims = await client.getIdTokenClaims();
        const initialAccessToken = await client.getAccessToken();
        const initialRefreshToken = await client.getRefreshToken();
        assert(initialRefreshToken, new Error('Missing refresh token after code exchange'));

        const readClaims = async (token: string) => {
          if (format === 'jwt') {
            const claims = decodeJwt(token);
            expect(claims.aud).toBe(resource?.indicator);
            return claims;
          }

          expect(token).not.toContain('.');
          const claims = await introspectToken(token);
          expect(claims.active).toBe(true);
          // Introspection must expose the extra claims at the top level.
          expect(claims).not.toHaveProperty('extra');

          const { payload } = await pool.one<{ payload: Record<string, unknown> }>(sql`
            select payload from oidc_model_instances
            where tenant_id = ${defaultTenantId} and model_name = 'AccessToken' and id = ${token}
          `);

          if (isDevFeaturesEnabled) {
            expect(payload.extra).toMatchObject({
              acr: 'urn:logto:acr:1fa',
              amr: ['pwd'],
              auth_time: idTokenClaims.auth_time,
            });
          } else {
            expect(payload.extra ?? {}).not.toHaveProperty('acr');
            expect(payload.extra ?? {}).not.toHaveProperty('amr');
            expect(payload.extra ?? {}).not.toHaveProperty('auth_time');
          }

          return claims;
        };

        const expectAuthenticationContext = (claims: Record<string, unknown>) => {
          if (isDevFeaturesEnabled) {
            expect(typeof idTokenClaims.auth_time).toBe('number');
            expect(claims).toMatchObject({
              acr: 'urn:logto:acr:1fa',
              amr: ['pwd'],
              auth_time: idTokenClaims.auth_time,
            });
          } else {
            expect(claims).not.toHaveProperty('acr');
            expect(claims).not.toHaveProperty('amr');
            expect(claims).not.toHaveProperty('auth_time');
          }
        };

        const initialClaims = await readClaims(initialAccessToken);
        expectAuthenticationContext(initialClaims);

        // A later issuance time must not replace the original authentication time.
        await setTimeout(1100);
        const rotated = await refreshTokens(initialRefreshToken, resource?.indicator);
        expect(rotated.refresh_token).toBeTruthy();
        expect(rotated.refresh_token).not.toBe(initialRefreshToken);
        const rotatedClaims = await readClaims(rotated.access_token);
        expectAuthenticationContext(rotatedClaims);
        expect(rotatedClaims.iat).toBeGreaterThan(Number(initialClaims.iat));

        // Use the replacement to catch a rotation that drops context from the refresh token.
        const next = await refreshTokens(rotated.refresh_token, resource?.indicator);
        expect(next.refresh_token).not.toBe(rotated.refresh_token);
        expectAuthenticationContext(await readClaims(next.access_token));

        await logoutClient(client);
      } finally {
        if (resource) {
          await deleteResource(resource.id);
        }
      }
    }
  );

  it.each(['opaque', 'jwt'] as const)(
    'preserves customizer precedence for authentication context claims in %s tokens',
    async (format) => {
      const resource = format === 'jwt' ? await createResource() : undefined;
      const customClaims = { acr: 'custom:acr', amr: ['custom'], auth_time: 123 };
      const readClaims = async (token: string) =>
        format === 'jwt' ? decodeJwt(token) : introspectToken(token);

      try {
        await upsertJwtCustomizer('access-token', {
          ...accessTokenJwtCustomizerPayload,
          script: `const getCustomJwtClaims = async () => (${JSON.stringify(customClaims)});`,
        });

        const client = await signIn(resource?.indicator);
        expect(await readClaims(await client.getAccessToken())).toMatchObject(customClaims);
        const refreshToken = await client.getRefreshToken();
        assert(refreshToken, new Error('Missing refresh token after code exchange'));
        const refreshed = await refreshTokens(refreshToken, resource?.indicator);
        expect(await readClaims(refreshed.access_token)).toMatchObject(customClaims);

        await logoutClient(client);
      } finally {
        await deleteJwtCustomizer('access-token');
        if (resource) {
          await deleteResource(resource.id);
        }
      }
    }
  );
});
