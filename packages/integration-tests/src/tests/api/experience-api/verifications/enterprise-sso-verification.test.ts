import { ConnectorType } from '@logto/connector-kit';

import { mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import {
  successFullyCreateEnterpriseSsoVerification,
  successFullyVerifyEnterpriseSsoAuthorization,
} from '#src/helpers/experience/enterprise-sso-verification.js';
import { successFullyCreateSocialVerification } from '#src/helpers/experience/social-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateUserId, randomString } from '#src/utils.js';

describe('enterprise sso verification', () => {
  const state = 'fake_state';
  const redirectUri = 'http://localhost:3000/redirect';
  const authorizationCode = 'fake_code';
  const domain = `foo${randomString()}.com`;
  const ssoConnectorApi = new SsoConnectorApi();
  const socialConnectorIdMap = new Map<string, string>();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
    await ssoConnectorApi.createMockOidcConnector([domain]);
    const { id: socialConnectorId } = await setSocialConnector();

    socialConnectorIdMap.set(mockSocialConnectorId, socialConnectorId);

    // Make sure single sign on is enabled
    await updateSignInExperience({
      singleSignOnEnabled: true,
    });
  });

  afterAll(async () => {
    await ssoConnectorApi.cleanUp();
    await clearConnectorsByTypes([ConnectorType.Social]);
  });

  describe('getSsoAuthorizationUri', () => {
    it('should throw if the state or redirectUri is empty', async () => {
      const client = await initExperienceClient();
      const connectorId = ssoConnectorApi.firstConnectorId!;

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

    it('should throw if the connector is not found', async () => {
      const client = await initExperienceClient();

      return expectRejects(
        client.getEnterpriseSsoAuthorizationUri('invalid_connector_id', {
          redirectUri,
          state,
        }),
        {
          code: 'entity.not_exists_with_id',
          status: 404,
        }
      );
    });

    it('should return the authorization uri', async () => {
      const client = await initExperienceClient();
      const connectorId = ssoConnectorApi.firstConnectorId!;

      const { authorizationUri, verificationId } = await client.getEnterpriseSsoAuthorizationUri(
        connectorId,
        {
          redirectUri,
          state,
        }
      );

      expect(verificationId).toBeTruthy();
      expect(authorizationUri).toBeTruthy();
    });
  });

  describe('verifyEnterpriseSsoAuthorization', () => {
    it('should throw if the verification record is not found', async () => {
      const client = await initExperienceClient();
      const connectorId = ssoConnectorApi.firstConnectorId!;

      await successFullyCreateEnterpriseSsoVerification(client, connectorId, {
        redirectUri,
        state,
      });

      await expectRejects(
        client.verifyEnterpriseSsoAuthorization(connectorId, {
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

    it('should throw if the verification type is not enterprise sso', async () => {
      const client = await initExperienceClient();
      const connectorId = socialConnectorIdMap.get(mockSocialConnectorId)!;

      const { verificationId } = await successFullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });

      await expectRejects(
        client.verifyEnterpriseSsoAuthorization(connectorId, {
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

    it('should throw if the connectorId does not match', async () => {
      const client = await initExperienceClient();
      const connectorId = ssoConnectorApi.firstConnectorId!;

      const { verificationId } = await successFullyCreateEnterpriseSsoVerification(
        client,
        connectorId,
        {
          redirectUri,
          state,
        }
      );

      await expectRejects(
        client.verifyEnterpriseSsoAuthorization('invalid_connector_id', {
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

    it('should successfully verify the authorization', async () => {
      const client = await initExperienceClient();
      const connectorId = ssoConnectorApi.firstConnectorId!;

      const { verificationId } = await successFullyCreateEnterpriseSsoVerification(
        client,
        connectorId,
        {
          redirectUri,
          state,
        }
      );

      // Pass the sub value as a callback connectorData to mock the SsoConnector.getUserInfo return value.
      const fakeSsoIdentitySub = generateUserId();

      await successFullyVerifyEnterpriseSsoAuthorization(client, connectorId, {
        verificationId,
        connectorData: {
          authorizationCode,
          sub: fakeSsoIdentitySub,
        },
      });
    });
  });

  describe('getSsoConnectorsByEmail', () => {
    const ssoConnectorApi = new SsoConnectorApi();
    const domain = `foo${randomString()}.com`;

    beforeAll(async () => {
      await ssoConnectorApi.createMockOidcConnector([domain]);

      await updateSignInExperience({
        singleSignOnEnabled: true,
      });
    });

    afterAll(async () => {
      await ssoConnectorApi.cleanUp();
    });

    it('should get sso connectors with given email properly', async () => {
      const client = new ExperienceClient();
      await client.initSession();

      const response = await client.getAvailableSsoConnectors('bar@' + domain);

      expect(response.connectorIds.length).toBeGreaterThan(0);
      expect(response.connectorIds[0]).toBe(ssoConnectorApi.firstConnectorId);
    });

    it('should return empty array if no sso connectors found', async () => {
      const client = new ExperienceClient();
      await client.initSession();

      const response = await client.getAvailableSsoConnectors('bar@invalid.com');

      expect(response.connectorIds.length).toBe(0);
    });

    it('should return empty array if sso is not enabled', async () => {
      await updateSignInExperience({
        singleSignOnEnabled: false,
      });

      const client = new ExperienceClient();
      await client.initSession();

      const response = await client.getAvailableSsoConnectors('bar@' + domain);

      expect(response.connectorIds.length).toBe(0);
    });
  });
});
