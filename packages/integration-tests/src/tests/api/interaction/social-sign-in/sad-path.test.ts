import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

import {
  mockEmailConnectorId,
  mockSmsConnectorId,
  mockSocialConnectorId,
} from '#src/__mocks__/connectors-mock.js';
import { suspendUser } from '#src/api/admin-user.js';
import {
  createSocialAuthorizationUri,
  patchInteractionIdentifiers,
  putInteraction,
  putInteractionEvent,
  putInteractionProfile,
} from '#src/api/interaction.js';
import { initClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setSocialConnector,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePhone, generateUserId } from '#src/utils.js';

const state = 'foo_state';
const redirectUri = 'http://foo.dev/callback';
const code = 'auth_code_foo';

describe('Social identifier interaction sad path', () => {
  const connectorIdMap = new Map<string, string>();
  const userSocialId = generateUserId();
  // eslint-disable-next-line @silverhand/fp/no-let
  let createdUserId: Optional<string>;

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    const { id: socialConnectorId } = await setSocialConnector();
    const { id: emailConnectorId } = await setEmailConnector();
    const { id: smsConnectorId } = await setSmsConnector();

    connectorIdMap.set(mockSocialConnectorId, socialConnectorId);
    connectorIdMap.set(mockEmailConnectorId, emailConnectorId);
    connectorIdMap.set(mockSmsConnectorId, smsConnectorId);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
  });

  /**
   * Note: As currently we can not prepare a social identities through admin api, register a user manually.
   */
  it('register with social', async () => {
    const client = await initClient();

    const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

    await client.successSend(patchInteractionIdentifiers, {
      connectorId,
      connectorData: { state, redirectUri, code, userId: userSocialId },
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.identity_not_exist',
      status: 422,
    });

    await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
    await client.successSend(putInteractionProfile, { connectorId });

    const { redirectTo } = await client.submitInteraction();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    createdUserId = await processSession(client, redirectTo);
    await logoutClient(client);
  });

  it('Should fail to sign-in if state is an empty string', async () => {
    const client = await initClient();
    const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await expectRejects(
      client.send(createSocialAuthorizationUri, {
        state: '',
        redirectUri,
        connectorId,
      }),
      {
        code: 'session.insufficient_info',
        status: 400,
      }
    );
  });

  it('Should fail to sign-in if an invalid redirectUri is provided', async () => {
    const client = await initClient();
    const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await expectRejects(
      client.send(createSocialAuthorizationUri, {
        state,
        redirectUri: 'invalid_uri',
        connectorId,
      }),
      {
        code: 'guard.invalid_input',
        status: 400,
      }
    );
  });

  it('Should fail to sign-in if the related connector is not a social connector', async () => {
    const client = await initClient();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    // Use email connector id
    await expectRejects(
      client.send(createSocialAuthorizationUri, {
        state,
        redirectUri,
        connectorId: connectorIdMap.get(mockEmailConnectorId) ?? '',
      }),
      {
        code: 'connector.unexpected_type',
        status: 400,
      }
    );

    // Use sms connector id
    await expectRejects(
      client.send(createSocialAuthorizationUri, {
        state,
        redirectUri,
        connectorId: connectorIdMap.get(mockSmsConnectorId) ?? '',
      }),
      {
        code: 'connector.unexpected_type',
        status: 400,
      }
    );
  });

  it('Should fail to sign-in if the related connector is not found', async () => {
    const client = await initClient();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await expectRejects(
      client.send(createSocialAuthorizationUri, {
        state,
        redirectUri,
        connectorId: 'invalid_connector_id',
      }),
      {
        code: 'entity.not_found',
        status: 404,
      }
    );
  });

  it('Should fail to update interaction identifiers if related connector id is incorrect', async () => {
    const client = await initClient();
    const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        connectorId: connectorIdMap.get(mockEmailConnectorId) ?? '',
        connectorData: { state, redirectUri, code, socialUserId: userSocialId },
      }),
      {
        code: 'session.invalid_connector_id',
        status: 422,
      }
    );
  });

  it('Should fail to update interaction identifiers if related connector id is not exist', async () => {
    const client = await initClient();
    const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        connectorId: 'non_exist_connector_id',
        connectorData: { state, redirectUri, code, socialUserId: userSocialId },
      }),
      {
        code: 'session.invalid_connector_id',
        status: 422,
      }
    );
  });

  it('Should fail to update verified identifier if the social interaction is not verified', async () => {
    const client = await initClient();
    const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

    // Email
    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        connectorId,
        email: generateEmail(),
      }),
      {
        code: 'session.connector_session_not_found',
        status: 400,
      }
    );

    // Phone
    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        connectorId,
        phone: generatePhone(),
      }),
      {
        code: 'session.connector_session_not_found',
        status: 400,
      }
    );
  });

  it('Should fail to update verified identifiers if related identifiers are not belong to the user', async () => {
    const client = await initClient();
    const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

    // Verify social interaction
    await client.successSend(patchInteractionIdentifiers, {
      connectorId,
      connectorData: { state, redirectUri, code, userId: userSocialId },
    });

    // Email
    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        connectorId,
        email: generateEmail(),
      }),
      {
        code: 'session.connector_session_not_found',
        status: 400,
      }
    );

    // Phone
    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        connectorId,
        phone: generatePhone(),
      }),
      {
        code: 'session.connector_session_not_found',
        status: 400,
      }
    );
  });

  it('Should fail to sign in with social if related user is suspended', async () => {
    const userId = createdUserId ?? '';
    await suspendUser(userId, true);

    const client = await initClient();
    const connectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

    await client.successSend(patchInteractionIdentifiers, {
      connectorId,
      connectorData: { state, redirectUri, code, userId: userSocialId },
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.suspended',
      status: 401,
    });

    // Reset
    await suspendUser(userId, false);
  });

  it('Should fail to sync profile if related connector id is incorrect on social user registration', async () => {
    const newUserSocialId = generateUserId();
    const client = await initClient();
    const socialEmail = generateEmail();

    const socialConnectorId = connectorIdMap.get(mockSocialConnectorId) ?? '';
    const smsConnectorId = connectorIdMap.get(mockSmsConnectorId) ?? '';

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(createSocialAuthorizationUri, {
      state,
      redirectUri,
      connectorId: socialConnectorId,
    });

    await client.successSend(patchInteractionIdentifiers, {
      connectorId: socialConnectorId,
      connectorData: { state, redirectUri, code, userId: newUserSocialId, email: socialEmail },
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.identity_not_exist',
      status: 422,
    });

    await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });

    await client.successSend(putInteractionProfile, {
      connectorId: smsConnectorId,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'session.connector_session_not_found',
      status: 404,
    });
  });
});
