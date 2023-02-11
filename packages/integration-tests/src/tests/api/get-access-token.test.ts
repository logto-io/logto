import path from 'path';

import { fetchTokenByRefreshToken } from '@logto/js';
import { defaultManagementApi, InteractionEvent } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import fetch from 'node-fetch';

import { putInteraction } from '#src/api/index.js';
import { assignUsersToRole } from '#src/api/role.js';
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

  beforeAll(async () => {
    await createUserByAdmin(guestUsername, password);
    const user = await createUserByAdmin(username, password);
    await assignUsersToRole([user.id], defaultManagementApi.role.id);
    await enableAllPasswordSignInMethods();
  });

  it('sign-in and getAccessToken with admin user', async () => {
    const client = new MockClient({
      resources: [defaultManagementApi.resource.indicator],
      scopes: [defaultManagementApi.scope.name],
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const accessToken = await client.getAccessToken(defaultManagementApi.resource.indicator);
    expect(accessToken).not.toBeNull();
    expect(getAccessTokenPayload(accessToken)).toHaveProperty(
      'scope',
      defaultManagementApi.scope.name
    );

    // Request for invalid resource should throw
    void expect(client.getAccessToken('api.foo.com')).rejects.toThrow();
  });

  it('sign-in and getAccessToken with guest user', async () => {
    const client = new MockClient({
      resources: [defaultManagementApi.resource.indicator],
      scopes: [defaultManagementApi.scope.name],
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username: guestUsername, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const accessToken = await client.getAccessToken(defaultManagementApi.resource.indicator);

    expect(getAccessTokenPayload(accessToken)).not.toHaveProperty(
      'scope',
      defaultManagementApi.scope.name
    );
  });

  it('sign-in and get multiple Access Token by the same Refresh Token within refreshTokenReuseInterval', async () => {
    const client = new MockClient({ resources: [defaultManagementApi.resource.indicator] });

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
          resource: defaultManagementApi.resource.indicator,
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
