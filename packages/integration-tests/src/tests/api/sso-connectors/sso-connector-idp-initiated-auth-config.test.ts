import { ApplicationType, type SsoConnector, type Application } from '@logto/schemas';

import { createApplication, deleteApplication } from '#src/api/application.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { randomString, devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('SAML IdP initiated authentication config', () => {
  const ssoConnectorsApi = new SsoConnectorApi();
  const applications = new Map<string, Application>();
  const ssoConnectors = new Map<string, SsoConnector>();
  const redirectUri = 'https://example.com/callback';

  beforeAll(async () => {
    const [samlConnector, oidcConnector] = await Promise.all([
      ssoConnectorsApi.createMockSamlConnector(['example.com']),
      ssoConnectorsApi.createMockOidcConnector(['example.com']),
    ]);

    ssoConnectors.set('saml', samlConnector);
    ssoConnectors.set('oidc', oidcConnector);

    const [spaApplication, webApplication, thirdPartyApplication, nativeApplication] =
      await Promise.all([
        createApplication(`spa-app-${randomString()}`, ApplicationType.SPA),
        createApplication(`web-app-${randomString()}`, ApplicationType.Traditional, {
          oidcClientMetadata: {
            redirectUris: [redirectUri],
            postLogoutRedirectUris: [],
          },
        }),
        createApplication(`third-party-app-${randomString()}`, ApplicationType.Traditional, {
          isThirdParty: true,
        }),
        createApplication(`native-app-${randomString()}`, ApplicationType.Native),
      ]);

    applications.set('spa', spaApplication);
    applications.set('traditional', webApplication);
    applications.set('thirdParty', thirdPartyApplication);
    applications.set('native', nativeApplication);
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
          autoSendAuthorizationRequest: true,
          redirectUri,
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
          autoSendAuthorizationRequest: true,
          redirectUri,
        }),
        {
          code: 'single_sign_on.idp_initiated_authentication_not_supported',
          status: 400,
        }
      );
    });

    it('should throw 404 if the application is not found', async () => {
      await expectRejects(
        ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
          connectorId: ssoConnectors.get('saml')!.id,
          defaultApplicationId: 'not-found',
          autoSendAuthorizationRequest: true,
          redirectUri,
        }),
        {
          code: 'entity.not_exists_with_id',
          status: 404,
        }
      );
    });

    describe('Create IdP-initiated authentication configuration with autoSendAuthorizationRequest enabled', () => {
      it.each(['spa', 'thirdParty', 'native'])(
        'should throw 400 if the application is not a first-party traditional web application',
        async (applicationKey) => {
          const defaultApplicationId = applications.get(applicationKey)!.id;
          await expectRejects(
            ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
              connectorId: ssoConnectors.get('saml')!.id,
              defaultApplicationId,
              autoSendAuthorizationRequest: true,
              redirectUri,
            }),
            {
              code: 'single_sign_on.idp_initiated_authentication_invalid_application_type',
              status: 400,
            }
          );
        }
      );

      it('should throw 400 if the redirect URI is not registered', async () => {
        const defaultApplicationId = applications.get('traditional')!.id;

        await expectRejects(
          ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
            connectorId: ssoConnectors.get('saml')!.id,
            defaultApplicationId,
            autoSendAuthorizationRequest: true,
            redirectUri: 'https://example.com/not-registered',
          }),
          {
            code: 'single_sign_on.idp_initiated_authentication_redirect_uri_not_registered',
            status: 400,
          }
        );
      });

      it('should create a new IdP-initiated authentication configuration for a SAML SSO connector', async () => {
        const defaultApplicationId = applications.get('traditional')!.id;

        const config = await ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
          connectorId: ssoConnectors.get('saml')!.id,
          defaultApplicationId,
          autoSendAuthorizationRequest: true,
          redirectUri,
        });

        expect(config).toMatchObject({
          defaultApplicationId,
          autoSendAuthorizationRequest: true,
          redirectUri,
        });
      });

      it('should update the exiting IdP-initiated authentication configuration for a SAML SSO connector', async () => {
        const defaultApplicationId = applications.get('traditional')!.id;
        const connectorId = ssoConnectors.get('saml')!.id;
        const authParameters = {
          scope: 'profile email offline_access',
          state: 'private_state',
        };

        const existingConfig = await ssoConnectorsApi.getSsoConnectorIdpInitiatedAuthConfig(
          connectorId
        );

        expect(existingConfig).not.toBeNull();

        const config = await ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
          connectorId,
          defaultApplicationId,
          autoSendAuthorizationRequest: true,
          authParameters,
        });

        expect(config).toMatchObject({
          defaultApplicationId,
          autoSendAuthorizationRequest: true,
          redirectUri: null,
          authParameters,
        });
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
          autoSendAuthorizationRequest: true,
        });

        expect(config).not.toBeNull();

        await deleteApplication(application.id);
        await expectRejects(ssoConnectorsApi.getSsoConnectorIdpInitiatedAuthConfig(connectorId), {
          code: 'entity.not_found',
          status: 404,
        });
      });
    });

    describe('Create IdP-initiated authentication configuration with autoSendAuthorizationRequest disabled', () => {
      const clientIdpInitiatedAuthCallbackUri = 'https://example.com/sso/sign-in';

      it.each(['thirdParty', 'native'])(
        'should throw 400 if the application is not supported',
        async (applicationKey) => {
          const defaultApplicationId = applications.get(applicationKey)!.id;
          await expectRejects(
            ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
              connectorId: ssoConnectors.get('saml')!.id,
              defaultApplicationId,
              autoSendAuthorizationRequest: false,
              clientIdpInitiatedAuthCallbackUri,
            }),
            {
              code: 'single_sign_on.idp_initiated_authentication_invalid_application_type',
              status: 400,
            }
          );
        }
      );

      it('should throw if the clientIdpInitiatedAuthCallbackUri is not provided', async () => {
        const defaultApplicationId = applications.get('spa')!.id;

        await expectRejects(
          ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
            connectorId: ssoConnectors.get('saml')!.id,
            defaultApplicationId,
            autoSendAuthorizationRequest: false,
          }),
          {
            code: 'guard.invalid_input',
            status: 400,
          }
        );
      });

      it('should create a new IdP-initiated authentication configuration for a SAML SSO connector', async () => {
        const defaultApplicationId = applications.get('spa')!.id;

        const config = await ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
          connectorId: ssoConnectors.get('saml')!.id,
          defaultApplicationId,
          autoSendAuthorizationRequest: false,
          clientIdpInitiatedAuthCallbackUri,
        });

        expect(config).toMatchObject({
          defaultApplicationId,
          autoSendAuthorizationRequest: false,
          clientIdpInitiatedAuthCallbackUri,
          redirectUri: null,
          authParameters: {},
        });
      });

      it('should be able to update the existing IdP-initiated authentication configuration for a SAML SSO connector', async () => {
        const connectorId = ssoConnectors.get('saml')!.id;

        const existingConfig = await ssoConnectorsApi.getSsoConnectorIdpInitiatedAuthConfig(
          connectorId
        );

        expect(existingConfig.clientIdpInitiatedAuthCallbackUri).not.toBeNull();
        expect(existingConfig.autoSendAuthorizationRequest).toBe(false);

        const defaultApplicationId = applications.get('traditional')!.id;

        const updatedConfig = await ssoConnectorsApi.setSsoConnectorIdpInitiatedAuthConfig({
          connectorId,
          defaultApplicationId,
          autoSendAuthorizationRequest: true,
          redirectUri,
        });

        expect(updatedConfig).toMatchObject({
          defaultApplicationId,
          autoSendAuthorizationRequest: true,
          clientIdpInitiatedAuthCallbackUri: null,
          redirectUri,
        });
      });
    });
  });
});
