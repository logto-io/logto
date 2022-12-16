import { ConnectorType, Event } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import {
  createSocialAuthorizationUri,
  putInteraction,
  patchInteraction,
  deleteUser,
} from '#src/api/index.js';
import { expectRejects } from '#src/helpers.js';
import { generateUserId } from '#src/utils.js';

import { initClient, logoutClient, processSession } from './utils/client.js';
import {
  clearConnectorsByTypes,
  clearConnectorById,
  setSocialConnector,
} from './utils/connector.js';
import { enableAllPasswordSignInMethods } from './utils/sign-in-experience.js';
import { generateNewUser } from './utils/user.js';

const state = 'foo_state';
const redirectUri = 'http://foo.dev/callback';
const code = 'auth_code_foo';

describe('Social Identifier Interactions', () => {
  const connectorIdMap = new Map<string, string>();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
    const { id } = await setSocialConnector();
    connectorIdMap.set(mockSocialConnectorId, id);
  });

  afterAll(async () => {
    await clearConnectorById(connectorIdMap.get(mockSocialConnectorId) ?? '');
  });

  describe('register new and sign-in', () => {
    const socialUserId = generateUserId();
    it('register with social', async () => {
      const client = await initClient();
      assert(client.interactionCookie, new Error('Session not found'));
      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await expect(
        createSocialAuthorizationUri({ state, redirectUri, connectorId }, client.interactionCookie)
      ).resolves.toBeTruthy();

      await expectRejects(
        putInteraction(
          {
            event: Event.SignIn,
            identifier: {
              connectorId,
              connectorData: { state, redirectUri, code, userId: socialUserId },
            },
          },
          client.interactionCookie
        ),
        'user.identity_not_exist'
      );

      const { redirectTo } = await patchInteraction(
        {
          event: Event.Register,
          profile: {
            connectorId,
          },
        },
        client.interactionCookie
      );

      await processSession(client, redirectTo);
      await logoutClient(client);
    });

    /*
     * Note: As currently we can not prepare a social identities through admin api.
     * The sign-in test case MUST run concurrently after the register test case
     */
    it('sign in with social', async () => {
      const client = await initClient();
      assert(client.interactionCookie, new Error('Session not found'));
      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await expect(
        createSocialAuthorizationUri({ state, redirectUri, connectorId }, client.interactionCookie)
      ).resolves.toBeTruthy();

      const { redirectTo } = await putInteraction(
        {
          event: Event.SignIn,
          identifier: {
            connectorId,
            connectorData: { state, redirectUri, code, userId: socialUserId },
          },
        },
        client.interactionCookie
      );
      const id = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(id);
    });
  });

  describe('bind to existing account and sign-in', () => {
    const socialUserId = generateUserId();

    beforeAll(async () => {
      await enableAllPasswordSignInMethods();
    });

    it('bind new social to a existing account', async () => {
      const {
        userProfile: { username, password },
      } = await generateNewUser({ username: true, password: true });
      const client = await initClient();
      assert(client.interactionCookie, new Error('Session not found'));
      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await expect(
        createSocialAuthorizationUri({ state, redirectUri, connectorId }, client.interactionCookie)
      ).resolves.toBeTruthy();

      await expectRejects(
        putInteraction(
          {
            event: Event.SignIn,
            identifier: {
              connectorId,
              connectorData: { state, redirectUri, code, userId: socialUserId },
            },
          },
          client.interactionCookie
        ),
        'user.identity_not_exist'
      );

      const { redirectTo } = await patchInteraction(
        {
          event: Event.SignIn,
          identifier: {
            username,
            password,
          },
          profile: {
            connectorId,
          },
        },
        client.interactionCookie
      );

      await processSession(client, redirectTo);
      await logoutClient(client);
    });

    it('sign in with social', async () => {
      const client = await initClient();
      assert(client.interactionCookie, new Error('Session not found'));
      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await expect(
        createSocialAuthorizationUri({ state, redirectUri, connectorId }, client.interactionCookie)
      ).resolves.toBeTruthy();

      const { redirectTo } = await putInteraction(
        {
          event: Event.SignIn,
          identifier: {
            connectorId,
            connectorData: { state, redirectUri, code, userId: socialUserId },
          },
        },
        client.interactionCookie
      );
      const id = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(id);
    });
  });
});
