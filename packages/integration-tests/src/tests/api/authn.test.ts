import { ApplicationType } from '@logto/schemas';

import {
  mockOktaSamlConnectorMetadata,
  mockOktaSamlAssertion,
} from '#src/__mocks__/sso-connectors-mock.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { getSsoAuthorizationUrl, postSamlAssertion } from '#src/api/interaction-sso.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest, randomString } from '#src/utils.js';

describe('SAML SSO ACS endpoint', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const encodedSamlAssertion = Buffer.from(mockOktaSamlAssertion).toString('base64');

  beforeAll(async () => {
    await ssoConnectorApi.createMockSamlConnector(
      ['example.com'],
      undefined,
      mockOktaSamlConnectorMetadata
    );
  });

  afterAll(async () => {
    await ssoConnectorApi.cleanUp();
  });

  it('should throw 404 if the session is not found', async () => {
    const connectorId = ssoConnectorApi.firstConnectorId!;

    await expectRejects(
      postSamlAssertion({
        connectorId,
        RelayState: 'foo',
        SAMLResponse: encodedSamlAssertion,
      }),
      {
        code: 'session.not_found',
        status: 400,
      }
    );
  });

  it('should throw 401 if the assertion is invalid', async () => {
    const connectorId = ssoConnectorApi.firstConnectorId!;
    const client = await initClient();

    const { redirectTo } = await client.send(getSsoAuthorizationUrl, {
      connectorId,
      state: 'foo_state',
      redirectUri: 'http://foo.dev/callback',
    });

    const url = new URL(redirectTo);
    const RelayState = url.searchParams.get('RelayState')!;

    const { providerConfig } = await ssoConnectorApi.getSsoConnectorById(connectorId);

    await expectRejects(
      postSamlAssertion({ connectorId, RelayState, SAMLResponse: encodedSamlAssertion }),
      {
        code: 'connector.authorization_failed',
        status: 401,
      }
    );
  });

  devFeatureTest.describe('IdP initiated SSO', () => {
    it('should throw 404 if no relayState is provided, and IdP initiated SSO is not enabled', async () => {
      const connectorId = ssoConnectorApi.firstConnectorId!;

      await expectRejects(
        postSamlAssertion({
          connectorId,
          RelayState: '',
          SAMLResponse: encodedSamlAssertion,
        }),
        {
          code: 'session.connector_validation_session_not_found',
          status: 404,
        }
      );
    });

    it('should try to process the SAML assertion if no relayState is provided and IdP initiated SSO is enabled', async () => {
      const connectorId = ssoConnectorApi.firstConnectorId!;
      const redirectUri = 'https://example.com/callback';
      const application = await createApplication(
        `web-app-${randomString()}`,
        ApplicationType.Traditional,
        {
          oidcClientMetadata: {
            redirectUris: [redirectUri],
            postLogoutRedirectUris: [],
          },
        }
      );

      await ssoConnectorApi.setSsoConnectorIdpInitiatedAuthConfig({
        connectorId,
        defaultApplicationId: application.id,
        autoSendAuthorizationRequest: true,
        redirectUri,
      });

      await expectRejects(
        postSamlAssertion({ connectorId, RelayState: '', SAMLResponse: encodedSamlAssertion }),
        {
          code: 'connector.authorization_failed',
          status: 401,
        }
      );

      await deleteApplication(application.id);
    });
  });
});
