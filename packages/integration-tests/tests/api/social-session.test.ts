import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import {
  mockSocialConnectorId,
  mockSocialConnectorTarget,
  mockSocialConnectorConfig,
} from '@/__mocks__/connectors-mock';
import {
  signInWithSocial,
  getAuthWithSocial,
  registerWithSocial,
  bindWithSocial,
  signInWithUsernameAndPassword,
  getUser,
} from '@/api';
import MockClient from '@/client';
import { setUpConnector, createUserByAdmin } from '@/helpers';
import { generateUsername, generatePassword } from '@/utils';

const state = 'foo_state';
const redirectUri = 'http://foo.dev/callback';
const code = 'auth_code_foo';

describe('social sign-in and register', () => {
  const socialUserId = crypto.randomUUID();

  beforeAll(async () => {
    await setUpConnector(mockSocialConnectorId, mockSocialConnectorConfig);
  });

  it('register with social', async () => {
    const client = new MockClient();

    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      signInWithSocial(
        { state, connectorId: mockSocialConnectorId, redirectUri },
        client.interactionCookie
      )
    ).resolves.toBeTruthy();

    const response = await getAuthWithSocial(
      {
        connectorId: mockSocialConnectorId,
        data: { state, redirectUri, code, userId: socialUserId },
      },
      client.interactionCookie
    ).catch((error: unknown) => error);

    // User with social does not exist
    expect(response instanceof HTTPError && response.response.statusCode === 422).toBe(true);

    // Register with social
    const { redirectTo } = await registerWithSocial(
      mockSocialConnectorId,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    expect(client.isAuthenticated).toBeTruthy();
  });

  /*
   * Note: As currently we can not prepare a social identities through admin api.
   * The sign-in test case MUST run concurrently after the register test case
   */
  it('Sign-In with social', async () => {
    const client = new MockClient();

    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      signInWithSocial(
        { state, connectorId: mockSocialConnectorId, redirectUri },
        client.interactionCookie
      )
    ).resolves.toBeTruthy();

    const { redirectTo } = await getAuthWithSocial(
      {
        connectorId: mockSocialConnectorId,
        data: { state, redirectUri, code, userId: socialUserId },
      },
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    expect(client.isAuthenticated).toBeTruthy();
  });
});

describe('social bind account', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await createUserByAdmin(username, password);
  });

  it('bind new social account', async () => {
    const client = new MockClient();

    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      signInWithSocial(
        { state, connectorId: mockSocialConnectorId, redirectUri },
        client.interactionCookie
      )
    ).resolves.toBeTruthy();

    const response = await getAuthWithSocial(
      { connectorId: mockSocialConnectorId, data: { state, redirectUri, code } },
      client.interactionCookie
    ).catch((error: unknown) => error);

    // User with social does not exist
    expect(response instanceof HTTPError && response.response.statusCode === 422).toBe(true);

    const { redirectTo } = await signInWithUsernameAndPassword(
      username,
      password,
      client.interactionCookie
    );

    await expect(
      bindWithSocial(mockSocialConnectorId, client.interactionCookie)
    ).resolves.not.toThrow();

    await client.processSession(redirectTo);

    // User should bind with social identities
    const { sub } = client.getIdTokenClaims();
    const user = await getUser(sub);

    expect(user.identities).toHaveProperty(mockSocialConnectorTarget);
  });
});
