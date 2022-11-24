import { SignUpIdentifier } from '@logto/schemas';
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
  signInWithPassword,
  getUser,
  postConnector,
  updateConnectorConfig,
} from '@/api';
import MockClient from '@/client';
import { createUserByAdmin, setSignUpIdentifier } from '@/helpers';
import { generateUsername, generatePassword } from '@/utils';

const state = 'foo_state';
const redirectUri = 'http://foo.dev/callback';
const code = 'auth_code_foo';

const connectorIdMap = new Map<string, string>();

describe('social sign-in and register', () => {
  const socialUserId = crypto.randomUUID();

  beforeAll(async () => {
    const { id } = await postConnector(mockSocialConnectorId);
    connectorIdMap.set(mockSocialConnectorId, id);
    await updateConnectorConfig(id, mockSocialConnectorConfig);

    await setSignUpIdentifier(SignUpIdentifier.None, false);
  });

  it('register with social', async () => {
    const client = new MockClient();

    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      signInWithSocial(
        { state, connectorId: connectorIdMap.get(mockSocialConnectorId) ?? '', redirectUri },
        client.interactionCookie
      )
    ).resolves.toBeTruthy();

    const response = await getAuthWithSocial(
      {
        connectorId: connectorIdMap.get(mockSocialConnectorId) ?? '',
        data: { state, redirectUri, code, userId: socialUserId },
      },
      client.interactionCookie
    ).catch((error: unknown) => error);

    // User with social does not exist
    expect(response instanceof HTTPError && response.response.statusCode === 422).toBe(true);

    // Register with social
    const { redirectTo } = await registerWithSocial(
      connectorIdMap.get(mockSocialConnectorId) ?? '',
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);
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
        { state, connectorId: connectorIdMap.get(mockSocialConnectorId) ?? '', redirectUri },
        client.interactionCookie
      )
    ).resolves.toBeTruthy();

    const { redirectTo } = await getAuthWithSocial(
      {
        connectorId: connectorIdMap.get(mockSocialConnectorId) ?? '',
        data: { state, redirectUri, code, userId: socialUserId },
      },
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);
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
        { state, connectorId: connectorIdMap.get(mockSocialConnectorId) ?? '', redirectUri },
        client.interactionCookie
      )
    ).resolves.toBeTruthy();

    const response = await getAuthWithSocial(
      {
        connectorId: connectorIdMap.get(mockSocialConnectorId) ?? '',
        data: { state, redirectUri, code },
      },
      client.interactionCookie
    ).catch((error: unknown) => error);

    // User with social does not exist
    expect(response instanceof HTTPError && response.response.statusCode === 422).toBe(true);

    const { redirectTo } = await signInWithPassword({
      username,
      password,
      interactionCookie: client.interactionCookie,
    });

    await expect(
      bindWithSocial(connectorIdMap.get(mockSocialConnectorId) ?? '', client.interactionCookie)
    ).resolves.not.toThrow();

    await client.processSession(redirectTo);

    // User should bind with social identities
    const { sub } = await client.getIdTokenClaims();
    const user = await getUser(sub);

    expect(user.identities).toHaveProperty(mockSocialConnectorTarget);
  });
});
