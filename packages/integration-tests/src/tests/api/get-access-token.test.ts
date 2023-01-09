import path from 'path';

import { fetchTokenByRefreshToken } from '@logto/js';
import { managementResource, InteractionEvent } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import fetch from 'node-fetch';

import { putInteraction } from '#src/api/index.js';
import MockClient, { defaultConfig } from '#src/client/index.js';
import { logtoUrl } from '#src/constants.js';
import { processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateUsername, generatePassword } from '#src/utils.js';

describe('get access token', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await createUserByAdmin(username, password);
    await enableAllPasswordSignInMethods();
  });

  it('sign-in and getAccessToken', async () => {
    const client = new MockClient({ resources: [managementResource.indicator] });

    await client.initSession();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);

    const accessToken = await client.getAccessToken(managementResource.indicator);

    expect(accessToken).not.toBeNull();

    // Request for invalid resource should throw
    void expect(client.getAccessToken('api.foo.com')).rejects.toThrow();
  });

  it('sign-in and get multiple Access Token by the same Refresh Token within refreshTokenReuseInterval', async () => {
    const client = new MockClient({ resources: [managementResource.indicator] });

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
          resource: managementResource.indicator,
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
