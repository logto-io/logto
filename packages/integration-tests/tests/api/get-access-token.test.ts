import path from 'path';

import { fetchTokenByRefreshToken } from '@logto/js';
import { managementResource } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';
import fetch from 'node-fetch';

import { signInWithUsernameAndPassword } from '@/api';
import MockClient, { defaultConfig } from '@/client';
import { logtoUrl } from '@/constants';
import { createUserByAdmin } from '@/helpers';
import { generateUsername, generatePassword } from '@/utils';

describe('get access token', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await createUserByAdmin(username, password);
  });

  it('sign-in and getAccessToken', async () => {
    const client = new MockClient({ resources: [managementResource.indicator] });
    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithUsernameAndPassword(
      username,
      password,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    assert(client.isAuthenticated, new Error('Sign in get get access token failed'));

    const accessToken = await client.getAccessToken(managementResource.indicator);

    expect(accessToken).not.toBeNull();

    // Request for invalid resource should throw
    void expect(client.getAccessToken('api.foo.com')).rejects.toThrow();
  });

  it('sign-in and get multiple Access Token by the same Refresh Token within refreshTokenReuseInterval', async () => {
    const client = new MockClient({ resources: [managementResource.indicator] });
    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithUsernameAndPassword(
      username,
      password,
      client.interactionCookie
    );

    await client.processSession(redirectTo);
    assert(client.isAuthenticated, new Error('Sign in get get access token failed'));

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
