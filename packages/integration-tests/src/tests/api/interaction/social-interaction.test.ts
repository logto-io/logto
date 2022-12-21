import { ConnectorType, Event } from '@logto/schemas';

import { mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import {
  createSocialAuthorizationUri,
  putInteraction,
  deleteUser,
  putInteractionEvent,
  patchInteractionIdentifiers,
  patchInteractionProfile,
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
    await enableAllPasswordSignInMethods();
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

      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: Event.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId },
      });

      await expectRejects(client.submitInteraction(), 'user.identity_not_exist');

      await client.successSend(putInteractionEvent, { event: Event.Register });
      await client.successSend(patchInteractionProfile, { connectorId });

      const { redirectTo } = await client.submitInteraction();

      await processSession(client, redirectTo);
      await logoutClient(client);
    });

    /*
     * Note: As currently we can not prepare a social identities through admin api.
     * The sign-in test case MUST run concurrently after the register test case
     */
    it('sign in with social', async () => {
      const client = await initClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: Event.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId },
      });

      const { redirectTo } = await client.submitInteraction();
      const id = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(id);
    });
  });

  describe('bind to existing account and sign-in', () => {
    const socialUserId = generateUserId();

    it('bind new social to a existing account', async () => {
      const {
        userProfile: { username, password },
      } = await generateNewUser({ username: true, password: true });
      const client = await initClient();

      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: Event.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId },
      });

      await expectRejects(client.submitInteraction(), 'user.identity_not_exist');

      await client.successSend(patchInteractionIdentifiers, { username, password });
      await client.successSend(patchInteractionProfile, { connectorId });

      const { redirectTo } = await client.submitInteraction();

      await processSession(client, redirectTo);
      await logoutClient(client);
    });

    it('sign in with social', async () => {
      const client = await initClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: Event.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId },
      });

      const { redirectTo } = await client.submitInteraction();
      const id = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(id);
    });
  });

  describe('bind with existing email account', () => {
    const socialUserId = generateUserId();

    it('bind new social to a existing account', async () => {
      const { userProfile, user } = await generateNewUser({ primaryEmail: true });
      const client = await initClient();

      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: Event.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: {
          state,
          redirectUri,
          code,
          userId: socialUserId,
          email: userProfile.primaryEmail,
        },
      });

      await expectRejects(client.submitInteraction(), 'user.identity_not_exist');

      await client.successSend(patchInteractionIdentifiers, { connectorId, identityType: 'email' });
      await client.successSend(patchInteractionProfile, { connectorId });

      const { redirectTo } = await client.submitInteraction();

      await processSession(client, redirectTo);
      await logoutClient(client);
    });

    it('sign in with social', async () => {
      const client = await initClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: Event.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId },
      });

      const { redirectTo } = await client.submitInteraction();
      const id = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(id);
    });
  });
});
