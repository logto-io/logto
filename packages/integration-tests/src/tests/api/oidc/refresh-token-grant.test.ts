import assert from 'node:assert';

import { decodeAccessToken } from '@logto/js';
import { type LogtoConfig, Prompt, PersistKey } from '@logto/node';
import { GrantType, InteractionEvent, demoAppApplicationId } from '@logto/schemas';
import { isKeyInObject, removeUndefinedKeys } from '@silverhand/essentials';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import ky, { HTTPError } from 'ky';

import { putInteraction } from '#src/api/index.js';
import MockClient, { defaultConfig } from '#src/client/index.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { processSession } from '#src/helpers/client.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { UserApiTest } from '#src/helpers/user.js';
import { generateUsername, generatePassword } from '#src/utils.js';

/** A helper class to simplify the test on grant errors. */
class GrantError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    super();
  }
}

/** Create a grant error matcher that matches certain elements of the error response. */
const grantErrorContaining = (code: string, description: string, status = 400) =>
  new GrantError(
    status,
    expect.objectContaining({
      code,
      error_description: description,
    })
  );

const accessDeniedError = grantErrorContaining(
  'oidc.access_denied',
  'user is not a member of the organization',
  400
);

const issuer = defaultConfig.endpoint + '/oidc';

class MockOrganizationClient extends MockClient {
  /** Perform the organization token grant. It may be replaced once our SDK supports it. */
  async fetchOrganizationToken(organizationId?: string, scopes?: string[]) {
    const refreshToken = await this.getRefreshToken();
    try {
      const json = await ky
        .post(`${this.config.endpoint}/oidc/token`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(
            removeUndefinedKeys({
              grant_type: GrantType.RefreshToken,
              client_id: this.config.appId,
              refresh_token: refreshToken ?? undefined,
              organization_id: organizationId,
              scope: scopes?.join(' '),
            })
          ),
        })
        .json();
      if (isKeyInObject(json, 'refresh_token')) {
        await this.storage.setItem(PersistKey.RefreshToken, String(json.refresh_token));
      }
      return json;
    } catch (error) {
      if (error instanceof HTTPError) {
        const json: unknown = JSON.parse(await error.response.text());
        console.error('HTTPError:', error.response.status, JSON.stringify(json, undefined, 2));
        throw new GrantError(error.response.status, json);
      }
      throw error;
    }
  }
}

/** An edited version that asserts the value is a record instead of an object */
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

describe('`refresh_token` grant (for organization tokens)', () => {
  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();
  const username = generateUsername();
  const password = generatePassword();
  // eslint-disable-next-line @silverhand/fp/no-let
  let userId = '';

  const initClient = async (configOverrides?: Partial<LogtoConfig>) => {
    const client = new MockOrganizationClient({
      appId: demoAppApplicationId,
      prompt: Prompt.Consent,
      scopes: ['urn:logto:scope:organizations'],
      resources: ['urn:logto:resource:organizations'],
      ...configOverrides,
    });
    await client.initSession(demoAppRedirectUri);
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    return client;
  };

  /**
   * Expect the response of the organization token grant. It validates the response json
   * and the access token payload. Note it does not validate the signature of the access token.
   *
   * @param response The response of the organization token grant (json object).
   * @param expectation The expected values of the response and the access token payload.
   */
  const expectGrantResponse = (
    response: unknown,
    expectation: {
      organizationId: string;
      scopes: string[];
      idToken?: boolean;
    }
  ) => {
    const { scopes, organizationId, idToken = true } = expectation;

    // Expect response
    assert(isObject(response), new Error('response is not an object'));
    expect(response).toMatchObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      access_token: expect.any(String),
      expires_in: 3600,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      refresh_token: expect.any(String),
      token_type: 'Bearer',
    });

    if (idToken) {
      expect(response.id_token).toEqual(expect.any(String));
    } else {
      expect(response).not.toHaveProperty('id_token');
    }

    expect(String(response.scope).split(' ').filter(Boolean).slice().sort()).toStrictEqual(
      scopes.slice().sort()
    );

    // Expect access token
    const accessToken = decodeAccessToken(String(response.access_token));

    expect(accessToken.jti).toEqual(expect.any(String));
    expect(accessToken.aud).toBe(`urn:logto:organization:${organizationId}`);
    expect(accessToken.sub).toBe(userId);
    expect(accessToken.client_id).toBe(demoAppApplicationId);
    expect(accessToken.iss).toBe(issuer);
  };

  /**
   * Initialize the test environment with some pre-defined data. It covers almost all
   * possible cases for a user. See the source code for details.
   */
  const initOrganizations = async () => {
    const [org1, org2, org3, org4] = await Promise.all([
      organizationApi.create({ name: 'org1' }),
      organizationApi.create({ name: 'org2' }),
      organizationApi.create({ name: 'org3' }),
      organizationApi.create({ name: 'org4' }),
    ]);
    const { roleApi, scopeApi } = organizationApi;

    await organizationApi.addUsers(org1.id, [userId]);
    await organizationApi.addUsers(org2.id, [userId]);
    await organizationApi.addUsers(org3.id, [userId]);

    const [scope1, scope2, scope3] = await Promise.all([
      scopeApi.create({ name: 'scope1' }),
      scopeApi.create({ name: 'scope2' }),
      scopeApi.create({ name: 'scope3' }),
    ]);
    const [role1, role2, role3, role4] = await Promise.all([
      roleApi.create({ name: 'role1' }),
      roleApi.create({ name: 'role2' }),
      roleApi.create({ name: 'role3' }),
      roleApi.create({ name: 'role4' }),
    ]);
    await Promise.all([
      roleApi.addScopes(role1.id, [scope1.id, scope2.id]),
      roleApi.addScopes(role2.id, [scope2.id, scope3.id]),
      roleApi.addScopes(role3.id, [scope1.id, scope3.id]),
    ]);

    await Promise.all([
      organizationApi.addUserRoles(org1.id, userId, [role1.id]),
      organizationApi.addUserRoles(org2.id, userId, [role1.id, role2.id]),
      organizationApi.addUserRoles(org3.id, userId, [role4.id]),
    ]);

    return Object.freeze({
      orgs: [org1, org2, org3, org4],
      roles: [role1, role2, role3, role4],
    } as const);
  };

  beforeAll(async () => {
    const { id } = await userApi.create({ username, password });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = id;
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  describe('sanity checks', () => {
    afterEach(async () => {
      await Promise.all([
        organizationApi.cleanUp(),
        organizationApi.roleApi.cleanUp(),
        organizationApi.scopeApi.cleanUp(),
      ]);
    });

    it('should perform the normal grant when organization id is not provided', async () => {
      const client = await initClient();
      const response = await client.fetchOrganizationToken();

      assert(isObject(response), new Error('response is not an object'));
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      expect(response).toMatchObject({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
        id_token: expect.any(String),
        expires_in: expect.any(Number),
        token_type: 'Bearer',
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */

      // The access token should not be a JWT
      expect(response.access_token).not.toContain('.');
    });

    it('should return error when organizations scope is not requested', async () => {
      const client = await initClient({ scopes: [] });
      await expect(client.fetchOrganizationToken('1')).rejects.toMatchError(
        grantErrorContaining('oidc.insufficient_scope', 'refresh token missing required scope', 403)
      );
    });

    it('should return access denied when organization id is invalid', async () => {
      const client = await initClient();
      await expect(client.fetchOrganizationToken('1')).rejects.toMatchError(accessDeniedError);
    });

    it('should return access denied when organization exists but user is not a member, then issue organization token after user is added to the organization', async () => {
      const org = await organizationApi.create({ name: 'org' });
      const client = await initClient();

      // Not a member yet
      await expect(client.fetchOrganizationToken(org.id)).rejects.toMatchError(accessDeniedError);

      // Add user to the organization
      await organizationApi.addUsers(org.id, [userId]);
      expectGrantResponse(await client.fetchOrganizationToken(org.id), {
        organizationId: org.id,
        scopes: [],
      });

      // Remove user from the organization
      await organizationApi.deleteUser(org.id, userId);
      await expect(client.fetchOrganizationToken(org.id)).rejects.toMatchError(accessDeniedError);
    });

    it('should issue organization scopes even organization resource is not requested (handled by SDK)', async () => {
      const { orgs } = await initOrganizations();

      const client = await initClient({
        scopes: ['urn:logto:scope:organizations', 'scope1', 'scope2'],
        resources: [],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[0].id), {
        organizationId: orgs[0].id,
        scopes: ['scope1', 'scope2'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[1].id), {
        organizationId: orgs[1].id,
        scopes: ['scope1', 'scope2'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[2].id), {
        organizationId: orgs[2].id,
        scopes: [],
      });
    });

    it('should issue a signed JWT', async () => {
      const org = await organizationApi.create({ name: 'org' });
      const client = await initClient();

      await organizationApi.addUsers(org.id, [userId]);

      const response = await client.fetchOrganizationToken(org.id);
      const rawToken = isObject(response) && String(response.access_token);

      assert(typeof rawToken === 'string', new TypeError('access_token is not a string'));

      await jwtVerify(
        rawToken,
        createRemoteJWKSet(new URL(defaultConfig.endpoint + '/oidc/jwks')),
        { issuer }
      );
    });
  });

  describe('permission checks', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let context: Awaited<ReturnType<typeof initOrganizations>>;

    beforeAll(async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      context = await initOrganizations();
    });

    afterAll(async () => {
      await Promise.all([
        organizationApi.cleanUp(),
        organizationApi.roleApi.cleanUp(),
        organizationApi.scopeApi.cleanUp(),
      ]);
    });

    it("should issue organization token according to user's role in the organization", async () => {
      const { orgs } = context;
      const client = await initClient({
        scopes: ['urn:logto:scope:organizations', 'scope1', 'scope2', 'scope3'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[0].id), {
        organizationId: orgs[0].id,
        scopes: ['scope1', 'scope2'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[1].id), {
        organizationId: orgs[1].id,
        scopes: ['scope1', 'scope2', 'scope3'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[2].id), {
        organizationId: orgs[2].id,
        scopes: [],
      });
    });

    it('should down-scope according to the refresh token and token request', async () => {
      const { orgs } = context;
      const client = await initClient({
        scopes: ['urn:logto:scope:organizations', 'scope1', 'scope2'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[0].id), {
        organizationId: orgs[0].id,
        scopes: ['scope1', 'scope2'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[1].id), {
        organizationId: orgs[1].id,
        scopes: ['scope1', 'scope2'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[1].id, ['scope1']), {
        organizationId: orgs[1].id,
        scopes: ['scope1'],
        idToken: false, // No ID token since no `openid` scope
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[2].id), {
        organizationId: orgs[2].id,
        scopes: [],
      });
    });

    it('should be able to dynamically update scopes', async () => {
      const { orgs, roles } = context;
      const client = await initClient({
        scopes: ['urn:logto:scope:organizations', 'scope1', 'scope2', 'scope3'],
      });

      expectGrantResponse(await client.fetchOrganizationToken(orgs[0].id), {
        organizationId: orgs[0].id,
        scopes: ['scope1', 'scope2'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[1].id), {
        organizationId: orgs[1].id,
        scopes: ['scope1', 'scope2', 'scope3'],
      });

      // Update scopes
      await Promise.all([
        organizationApi.addUserRoles(orgs[0].id, userId, [roles[2].id]),
        organizationApi.deleteUserRole(orgs[1].id, userId, roles[0].id),
        organizationApi.deleteUserRole(orgs[1].id, userId, roles[1].id),
      ]);

      expectGrantResponse(await client.fetchOrganizationToken(orgs[0].id), {
        organizationId: orgs[0].id,
        scopes: ['scope1', 'scope2', 'scope3'],
      });
      expectGrantResponse(await client.fetchOrganizationToken(orgs[1].id), {
        organizationId: orgs[1].id,
        scopes: [],
      });
    });
  });
});
