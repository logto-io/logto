import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, InteractionIdentifierType } from '@logto/schemas';

import { mockEmailConnectorId, mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import {
  successFullyCreateSocialVerification,
  successFullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('social verification', () => {
  const state = 'fake_state';
  const redirectUri = 'http://localhost:3000/redirect';
  const authorizationCode = 'fake_code';
  const connectorIdMap = new Map<string, string>();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);

    const { id: emailConnectorId } = await setEmailConnector();
    const { id: socialConnectorId } = await setSocialConnector();
    connectorIdMap.set(mockSocialConnectorId, socialConnectorId);
    connectorIdMap.set(mockEmailConnectorId, emailConnectorId);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);
  });

  describe('getSocialAuthorizationUri', () => {
    it('should throw if the state or redirectUri is empty', async () => {
      const client = await initExperienceClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;

      await expectRejects(
        client.getSocialAuthorizationUri(connectorId, {
          redirectUri,
          state: '',
        }),
        {
          code: 'session.insufficient_info',
          status: 400,
        }
      );

      await expectRejects(
        client.getSocialAuthorizationUri(connectorId, {
          redirectUri: '',
          state,
        }),
        {
          code: 'session.insufficient_info',
          status: 400,
        }
      );
    });

    it('should throw if the connector is not a social connector', async () => {
      const client = await initExperienceClient();
      const connectorId = connectorIdMap.get(mockEmailConnectorId)!;

      await expectRejects(
        client.getSocialAuthorizationUri(connectorId, {
          redirectUri,
          state,
        }),
        {
          code: 'connector.unexpected_type',
          status: 400,
        }
      );
    });

    it('should throw if the connector is not found', async () => {
      const client = await initExperienceClient();

      await expectRejects(
        client.getSocialAuthorizationUri('invalid_connector_id', {
          redirectUri,
          state,
        }),
        {
          code: 'entity.not_found',
          status: 404,
        }
      );
    });

    it('should return the authorizationUri and verificationId', async () => {
      const client = await initExperienceClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;

      await successFullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });
    });
  });

  describe('verifySocialAuthorization', () => {
    it('should throw if the verification record is not found', async () => {
      const client = await initExperienceClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;

      await successFullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });

      await expectRejects(
        client.verifySocialAuthorization(connectorId, {
          verificationId: 'invalid_verification_id',
          connectorData: {
            authorizationCode,
          },
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });

    it('should throw if the verification type is not social', async () => {
      const client = await initExperienceClient();
      const connectorId = connectorIdMap.get(mockEmailConnectorId)!;

      const { verificationId } = await client.sendVerificationCode({
        identifier: {
          type: InteractionIdentifierType.Email,
          value: 'foo',
        },
        interactionEvent: InteractionEvent.SignIn,
      });

      await expectRejects(
        client.verifySocialAuthorization(connectorId, {
          verificationId,
          connectorData: {
            authorizationCode,
          },
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });

    it('should throw if the connectorId is different', async () => {
      const client = await initExperienceClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;

      const { verificationId } = await client.getSocialAuthorizationUri(connectorId, {
        redirectUri,
        state,
      });

      await expectRejects(
        client.verifySocialAuthorization('invalid_connector_id', {
          verificationId,
          connectorData: {
            authorizationCode,
          },
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });

    it('should successfully verify the social authorization', async () => {
      const client = await initExperienceClient();
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;

      const { verificationId } = await successFullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });

      await successFullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: {
          code: authorizationCode,
        },
      });
    });
  });
});
