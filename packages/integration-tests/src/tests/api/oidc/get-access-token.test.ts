import path from 'node:path';

import { fetchTokenByRefreshToken } from '@logto/js';
import { InteractionEvent, type Resource, RoleType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { createResource, deleteResource, deleteUser, putInteraction } from '#src/api/index.js';
import { assignUsersToRole, createRole, deleteRole } from '#src/api/role.js';
import { createScope, deleteScope } from '#src/api/scope.js';
import MockClient, { defaultConfig } from '#src/client/index.js';
import { logtoUrl } from '#src/constants.js';
import { processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateUsername, generatePassword, getAccessTokenPayload } from '#src/utils.js';

describe('get access token', () => {
  const username = generateUsername();
  const password = generatePassword();
  const guestUsername = generateUsername();
  const testApiResourceInfo: Pick<Resource, 'name' | 'indicator'> = {
    name: 'test-api-resource',
    indicator: 'https://foo.logto.io/api',
  };
  const testApiScopeNames = ['read', 'write', 'delete', 'update'];

  /* eslint-disable @silverhand/fp/no-let */
  let testApiResourceId: string;
  let testApiScopeIds: string[];
  let testApiUserRoleId: string;
  let guestUserId: string;
  /* eslint-enable @silverhand/fp/no-let */

  /* eslint-disable @silverhand/fp/no-mutation */
  beforeAll(async () => {
    const guestUser = await createUserByAdmin({ username: guestUsername, password });
    guestUserId = guestUser.id;
    const user = await createUserByAdmin({ username, password });
    const testApiResource = await createResource(
      testApiResourceInfo.name,
      testApiResourceInfo.indicator
    );
    testApiResourceId = testApiResource.id;
    const testApiScopes = await Promise.all(
      testApiScopeNames.map(async (name) => createScope(testApiResource.id, name))
    );
    testApiScopeIds = testApiScopes.map(({ id }) => id);
    const testApiUserRole = await createRole({
      name: 'test-api-user-role',
      type: RoleType.User,
      scopeIds: testApiScopes.map(({ id }) => id),
    });
    testApiUserRoleId = testApiUserRole.id;
    await assignUsersToRole([user.id], testApiUserRole.id);
    await enableAllPasswordSignInMethods();
  });
  /* eslint-enable @silverhand/fp/no-mutation */

  afterAll(async () => {
    if (testApiUserRoleId) {
      await deleteRole(testApiUserRoleId);
    }
    if (testApiResourceId) {
      await Promise.all(testApiScopeIds.map(async (id) => deleteScope(testApiResourceId, id)));
      await deleteResource(testApiResourceId);
    }
    if (guestUserId) {
      await deleteUser(guestUserId);
    }
  });

  it('can sign in and getAccessToken with admin user', async () => {
    const client = new MockClient({
      resources: [testApiResourceInfo.indicator],
      scopes: testApiScopeNames,
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const accessToken = await client.getAccessToken(testApiResourceInfo.indicator);
    expect(accessToken).not.toBeNull();
    expect(getAccessTokenPayload(accessToken)).toHaveProperty('scope', testApiScopeNames.join(' '));

    // Request for invalid resource should throw
    void expect(client.getAccessToken('api.foo.com')).rejects.toThrow();
  });

  it('can sign in and getAccessToken with guest user', async () => {
    const client = new MockClient({
      resources: [testApiResourceInfo.indicator],
      scopes: testApiScopeNames,
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username: guestUsername, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const accessToken = await client.getAccessToken(testApiResourceInfo.indicator);

    expect(getAccessTokenPayload(accessToken)).not.toHaveProperty(
      'scope',
      testApiScopeNames.join(' ')
    );
  });

  it('sign in and verify jwt', async () => {
    const client = new MockClient({
      resources: [testApiResourceInfo.indicator],
      scopes: testApiScopeNames,
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username: guestUsername, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const accessToken = await client.getAccessToken(testApiResourceInfo.indicator);
    await expect(
      jwtVerify(accessToken, createRemoteJWKSet(new URL('/oidc/jwks', logtoUrl)), {
        issuer: new URL('/oidc', logtoUrl).href,
        audience: testApiResourceInfo.indicator,
        requiredClaims: ['scope', 'client_id'],
        subject: guestUserId,
      })
    ).resolves.toBeTruthy();
  });

  it('can sign in and get multiple Access Tokens by the same Refresh Token within refreshTokenReuseInterval', async () => {
    const client = new MockClient({ resources: [testApiResourceInfo.indicator] });

    await client.initSession();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);

    const refreshToken = await client.getRefreshToken();

    assert(refreshToken, new Error('No Refresh Token found'));

    const getAccessTokenByRefreshToken = async () =>
      fetchTokenByRefreshToken(
        {
          clientId: defaultConfig.appId,
          tokenEndpoint: path.join(logtoUrl, '/oidc/token'),
          refreshToken,
          resource: testApiResourceInfo.indicator,
        },
        async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
          const response = await fetch(...args);
          assert(response.ok, new Error('Request error'));

          return response.json();
        }
      );

    // Allow to use the same refresh token to fetch access token within short time period
    await Promise.all([getAccessTokenByRefreshToken(), getAccessTokenByRefreshToken()]);
  });
});
