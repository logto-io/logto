import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import {
  createSocialAuthorizationUri,
  putInteraction,
  deleteUser,
  putInteractionEvent,
  patchInteractionIdentifiers,
  putInteractionProfile,
  patchInteractionProfile,
} from '#src/api/index.js';
import { initClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setSocialConnector,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateUserId, generateUsername, generateEmail, generatePhone } from '#src/utils.js';

const state = 'foo_state';
const redirectUri = 'http://foo.dev/callback';
const code = 'auth_code_foo';

describe('Social Identifier Interactions', () => {
  const connectorIdMap = new Map<string, string>();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);

    const { id } = await setSocialConnector();
    await setEmailConnector();
    await setSmsConnector();
    connectorIdMap.set(mockSocialConnectorId, id);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
  });

  describe('register new and sign-in', () => {
    const socialUserId = generateUserId();

    it('register with social', async () => {
      const client = await initClient();

      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId },
      });

      await expectRejects(client.submitInteraction(), 'user.identity_not_exist');

      await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
      await client.successSend(putInteractionProfile, { connectorId });

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
        event: InteractionEvent.SignIn,
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
      const { userProfile } = await generateNewUser({ primaryEmail: true });
      const client = await initClient();

      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
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

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        email: userProfile.primaryEmail,
      });
      await client.successSend(putInteractionProfile, { connectorId });

      const { redirectTo } = await client.submitInteraction();

      await processSession(client, redirectTo);
      await logoutClient(client);
    });

    it('sign in with social', async () => {
      const client = await initClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
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

  describe('register and link mandatory profile', () => {
    const socialUserId = generateUserId();

    it('bind username', async () => {
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      });

      const client = await initClient();

      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId },
      });

      await expectRejects(client.submitInteraction(), 'user.identity_not_exist');

      await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
      await client.successSend(putInteractionProfile, { connectorId });

      await expectRejects(client.submitInteraction(), 'user.missing_profile');

      await client.successSend(patchInteractionProfile, { username: generateUsername() });

      const { redirectTo } = await client.submitInteraction();

      const userId = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(userId);
    });

    it('directly bind social trusted email', async () => {
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      });

      const client = await initClient();

      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId, email: generateEmail() },
      });

      await expectRejects(client.submitInteraction(), 'user.identity_not_exist');

      await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
      await client.successSend(putInteractionProfile, { connectorId });

      const { redirectTo } = await client.submitInteraction();

      const userId = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(userId);
    });

    it('directly bind social trusted phone', async () => {
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Phone],
        password: true,
        verify: true,
      });

      const client = await initClient();

      const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
      });

      await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

      await client.successSend(patchInteractionIdentifiers, {
        connectorId,
        connectorData: { state, redirectUri, code, userId: socialUserId, phone: generatePhone() },
      });

      await expectRejects(client.submitInteraction(), 'user.identity_not_exist');

      await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
      await client.successSend(putInteractionProfile, { connectorId });

      const { redirectTo } = await client.submitInteraction();

      const userId = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(userId);
    });
  });
});
