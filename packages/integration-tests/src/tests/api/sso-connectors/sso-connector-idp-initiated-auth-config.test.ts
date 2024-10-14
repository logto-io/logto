import { ApplicationType, type SsoConnector, type Application } from '@logto/schemas';

import { createApplication, deleteApplication } from '#src/api/application.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { randomString, devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('SAML IdP initiated authentication config', () => {
  const ssoConnectorsApi = new SsoConnectorApi();
  const applications = new Map<string, Application>();
  const ssoConnectors = new Map<string, SsoConnector>();

  beforeAll(async () => {
    const [samlConnector, oidcConnector] = await Promise.all([
      ssoConnectorsApi.createMockSamlConnector(['example.com']),
      ssoConnectorsApi.createMockOidcConnector(['example.com']),
    ]);

    ssoConnectors.set('saml', samlConnector);
    ssoConnectors.set('oidc', oidcConnector);

    const [spaApplication, webApplication, thirdPartyApplication] = await Promise.all([
      createApplication(`spa-app-${randomString()}`, ApplicationType.SPA),
      createApplication(`web-app-${randomString()}`, ApplicationType.Traditional),
      createApplication(`third-party-app-${randomString()}`, ApplicationType.Traditional, {
        isThirdParty: true,
      }),
    ]);

    applications.set('spa', spaApplication);
    applications.set('traditional', webApplication);
    applications.set('thirdParty', thirdPartyApplication);
  });

  afterAll(async () => {
    await Promise.all(
      Array.from(applications.values()).map(async (app) => deleteApplication(app.id))
    );
    await ssoConnectorsApi.cleanUp();
  });

  describe('Set IdP-initiated authentication configuration', () => {
    it('should throw 404 if the connector is not found', async () => {
      const defaultApplicationId = applications.get('traditional')!.id;

      await expectRejects(
        ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
          connectorId: 'not-found',
          defaultApplicationId,
          redirectUri: 'https://example.com',
        }),
        {
          code: 'entity.not_exists_with_id',
          status: 404,
        }
      );
    });

    it('should throw 400 if the connector is not SAML', async () => {
      const defaultApplicationId = applications.get('traditional')!.id;

      await expectRejects(
        ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
          connectorId: ssoConnectors.get('oidc')!.id,
          defaultApplicationId,
          redirectUri: 'https://example.com',
        }),
        {
          code: 'connector.saml_only_idp_initiated_auth',
          status: 400,
        }
      );
    });

    it('should throw 404 if the application is not found', async () => {
      await expectRejects(
        ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
          connectorId: ssoConnectors.get('saml')!.id,
          defaultApplicationId: 'not-found',
          redirectUri: 'https://example.com',
        }),
        {
          code: 'entity.not_exists_with_id',
          status: 404,
        }
      );
    });

    it.each(['spa', 'thirdParty'])(
      'should throw 400 if the application is not a first-party traditional web application',
      async (applicationKey) => {
        const defaultApplicationId = applications.get(applicationKey)!.id;
        await expectRejects(
          ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
            connectorId: ssoConnectors.get('saml')!.id,
            defaultApplicationId,
            redirectUri: 'https://example.com',
          }),
          {
            code: 'connector.saml_idp_initiated_auth_invalid_application_type',
            status: 400,
          }
        );
      }
    );

    it('should create a new IdP-initiated authentication configuration for a SAML SSO connector', async () => {
      const defaultApplicationId = applications.get('traditional')!.id;
      const redirectUri = 'https://example.com';
      const authParameters = {
        scope: 'profile email',
      };
      const connectorId = ssoConnectors.get('saml')!.id;

      const config = await ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
        connectorId,
        defaultApplicationId,
        redirectUri,
        authParameters,
      });

      expect(config).toMatchObject({
        defaultApplicationId,
        redirectUri,
        authParameters,
      });

      const fetchedConfig = await ssoConnectorsApi.getSsoConnectorIdpInitiatedAuthConfig(
        connectorId
      );

      expect(fetchedConfig).toMatchObject(config);
    });

    it('should cascade delete the IdP-initiated authentication configuration when the application is deleted', async () => {
      const application = await createApplication(
        `web-app-${randomString()}`,
        ApplicationType.Traditional
      );
      const connectorId = ssoConnectors.get('saml')!.id;

      const config = await ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
        connectorId,
        defaultApplicationId: application.id,
        redirectUri: 'https://example.com',
      });

      expect(config).not.toBeNull();

      await deleteApplication(application.id);

      await expectRejects(ssoConnectorsApi.getSsoConnectorIdpInitiatedAuthConfig(connectorId), {
        code: 'entity.not_found',
        status: 404,
      });
    });
  });
});
