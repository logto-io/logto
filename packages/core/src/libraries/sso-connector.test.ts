import { Prompt, QueryKey, ReservedScope, UserScope } from '@logto/js';
import { ApplicationType, type SsoConnectorIdpInitiatedAuthConfig } from '@logto/schemas';

import { mockSsoConnector, wellConfiguredSsoConnector } from '#src/__mocks__/sso.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createSsoConnectorLibrary } from './sso-connector.js';

const { jest } = import.meta;

const findAllSsoConnectors = jest.fn();
const getConnectorById = jest.fn();
const findApplicationById = jest.fn();
const insertIdpInitiatedAuthConfig = jest.fn();
const updateIdpInitiatedAuthConfig = jest.fn();

const queries = new MockQueries({
  ssoConnectors: {
    findAll: findAllSsoConnectors,
    findById: getConnectorById,
    insertIdpInitiatedAuthConfig,
  },
  applications: { findApplicationById },
});

describe('SsoConnectorLibrary', () => {
  const ssoConnectorLibrary = createSsoConnectorLibrary(queries);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getSsoConnectors() should filter unsupported sso connectors', async () => {
    const { getSsoConnectors } = ssoConnectorLibrary;

    findAllSsoConnectors.mockResolvedValueOnce([
      2,
      [
        mockSsoConnector,
        {
          ...mockSsoConnector,
          providerName: 'unsupported',
        },
      ],
    ]);

    const connectors = await getSsoConnectors();

    expect(connectors).toEqual([2, [mockSsoConnector]]);
  });

  it('getAvailableSsoConnectors() should filter sso connectors with invalid config', async () => {
    const { getAvailableSsoConnectors } = ssoConnectorLibrary;

    findAllSsoConnectors.mockResolvedValueOnce([
      2,
      [
        {
          ...mockSsoConnector,
          domains: ['foo.com'],
        },
        wellConfiguredSsoConnector,
      ],
    ]);

    const connectors = await getAvailableSsoConnectors();

    expect(connectors).toEqual([wellConfiguredSsoConnector]);
  });

  it('getAvailableSsoConnectors() should filter sso connectors with empty domains', async () => {
    const { getAvailableSsoConnectors } = ssoConnectorLibrary;

    findAllSsoConnectors.mockResolvedValueOnce([
      2,
      [
        {
          ...mockSsoConnector,
          config: wellConfiguredSsoConnector.config,
        },
        wellConfiguredSsoConnector,
      ],
    ]);

    const connectors = await getAvailableSsoConnectors();

    expect(connectors).toEqual([wellConfiguredSsoConnector]);
  });

  it('getSsoConnectorById() should throw 404 if the connector is not supported', async () => {
    const { getSsoConnectorById } = ssoConnectorLibrary;

    getConnectorById.mockResolvedValueOnce({
      ...mockSsoConnector,
      providerName: 'unsupported',
    });

    await expect(getSsoConnectorById('id')).rejects.toMatchError(
      new RequestError({
        code: 'connector.not_found',
        status: 404,
      })
    );
  });

  it('getSsoConnectorById() should return the connector if it is supported', async () => {
    const { getSsoConnectorById } = ssoConnectorLibrary;

    getConnectorById.mockResolvedValueOnce(mockSsoConnector);

    const connector = await getSsoConnectorById('id');

    expect(connector).toEqual(mockSsoConnector);
  });

  describe('createSsoConnectorIdpInitiatedAuthConfig()', () => {
    it.each([
      ApplicationType.MachineToMachine,
      ApplicationType.Native,
      ApplicationType.Protected,
      ApplicationType.SPA,
    ])(
      'createSsoConnectorIdpInitiatedAuthConfig() should throw 400 if the application type is $s, and autoSendAuthorizationRequest is enabled',
      async (type) => {
        findApplicationById.mockResolvedValueOnce({ type, isThirdParty: false });

        await expect(
          ssoConnectorLibrary.createSsoConnectorIdpInitiatedAuthConfig({
            connectorId: 'connectorId',
            defaultApplicationId: 'appId',
            autoSendAuthorizationRequest: true,
          })
        ).rejects.toMatchError(
          new RequestError('single_sign_on.idp_initiated_authentication_invalid_application_type', {
            type: ApplicationType.Traditional,
          })
        );

        expect(insertIdpInitiatedAuthConfig).not.toHaveBeenCalled();
      }
    );

    it.each([ApplicationType.MachineToMachine, ApplicationType.Native, ApplicationType.Protected])(
      'createSsoConnectorIdpInitiatedAuthConfig() should throw if 400 the application type is $s, and autoSendAuthorizationRequest is disabled',
      async (type) => {
        findApplicationById.mockResolvedValueOnce({ type, isThirdParty: false });

        await expect(
          ssoConnectorLibrary.createSsoConnectorIdpInitiatedAuthConfig({
            connectorId: 'connectorId',
            defaultApplicationId: 'appId',
            autoSendAuthorizationRequest: false,
            clientIdpInitiatedAuthCallbackUri: 'https://callback.com',
          })
        ).rejects.toMatchError(
          new RequestError('single_sign_on.idp_initiated_authentication_invalid_application_type', {
            type: `${ApplicationType.Traditional}, ${ApplicationType.SPA}`,
          })
        );

        expect(insertIdpInitiatedAuthConfig).not.toHaveBeenCalled();
      }
    );

    it('createSsoConnectorIdpInitiatedAuthConfig() should throw 400 if the application is third-party app', async () => {
      findApplicationById.mockResolvedValueOnce({
        type: ApplicationType.Traditional,
        isThirdParty: true,
      });

      await expect(
        ssoConnectorLibrary.createSsoConnectorIdpInitiatedAuthConfig({
          connectorId: 'connectorId',
          defaultApplicationId: 'appId',
          autoSendAuthorizationRequest: true,
        })
      ).rejects.toMatchError(
        new RequestError('single_sign_on.idp_initiated_authentication_invalid_application_type', {
          type: ApplicationType.Traditional,
        })
      );

      expect(insertIdpInitiatedAuthConfig).not.toHaveBeenCalled();
    });

    it('should throw 400 error if the redirectUri is not registered', async () => {
      findApplicationById.mockResolvedValueOnce({
        type: ApplicationType.Traditional,
        isThirdParty: false,
        oidcClientMetadata: {
          redirectUris: ['https://fallback.com'],
        },
      });

      await expect(
        ssoConnectorLibrary.createSsoConnectorIdpInitiatedAuthConfig({
          connectorId: 'connectorId',
          defaultApplicationId: 'appId',
          autoSendAuthorizationRequest: true,
          redirectUri: 'https://invalid.com',
        })
      ).rejects.toMatchError(
        new RequestError('single_sign_on.idp_initiated_authentication_redirect_uri_not_registered')
      );

      expect(insertIdpInitiatedAuthConfig).not.toHaveBeenCalled();
    });
  });

  describe('getIdpInitiatedSamlSsoSignInUrl()', () => {
    const { getIdpInitiatedSamlSsoSignInUrl } = ssoConnectorLibrary;

    const issuer = 'https://example.com/oidc';

    const authConfig: SsoConnectorIdpInitiatedAuthConfig = {
      tenantId: 'tenantId',
      defaultApplicationId: 'appId',
      autoSendAuthorizationRequest: true,
      clientIdpInitiatedAuthCallbackUri: null,
      connectorId: 'connectorId',
      redirectUri: 'https://app.com',
      authParameters: {},
      createdAt: Date.now(),
    };

    const defaultQueryParameters = {
      [QueryKey.ClientId]: authConfig.defaultApplicationId,
      [QueryKey.ResponseType]: 'code',
      [QueryKey.Prompt]: Prompt.Login,
      [QueryKey.DirectSignIn]: `sso:${authConfig.connectorId}`,
    };

    it('the returned sign-in url should be a auth endpoint', async () => {
      const url = await getIdpInitiatedSamlSsoSignInUrl(issuer, authConfig);
      expect(url.toString().indexOf(issuer)).toBe(0);
    });

    it('the returned sign-in url should contain the default query parameters', async () => {
      const url = await getIdpInitiatedSamlSsoSignInUrl(issuer, authConfig);
      const parameters = new URLSearchParams(url.search);
      for (const [key, value] of Object.entries(defaultQueryParameters)) {
        expect(parameters.get(key)).toBe(value);
      }
      expect(parameters.get(QueryKey.Scope)).toBe(`${ReservedScope.OpenId} ${UserScope.Profile}`);
    });

    it('should use the provided redirectUri', async () => {
      const url = await getIdpInitiatedSamlSsoSignInUrl(issuer, authConfig);

      expect(findApplicationById).not.toHaveBeenCalled();
      const parameters = new URLSearchParams(url.search);
      expect(parameters.get(QueryKey.RedirectUri)).toBe(authConfig.redirectUri);
    });

    it('should use the first registered redirectUri of the default application if not provided', async () => {
      findApplicationById.mockResolvedValueOnce({
        oidcClientMetadata: {
          redirectUris: ['https://fallback.com'],
        },
      });

      const url = await getIdpInitiatedSamlSsoSignInUrl(issuer, {
        ...authConfig,
        redirectUri: null,
      });

      expect(findApplicationById).toHaveBeenCalledWith(authConfig.defaultApplicationId);
      const parameters = new URLSearchParams(url.search);
      expect(parameters.get(QueryKey.RedirectUri)).toBe('https://fallback.com');
    });

    it('should append extra scopes to the query parameters', async () => {
      const scopes = ['organization', 'email', 'profile'];

      const url = await getIdpInitiatedSamlSsoSignInUrl(issuer, {
        ...authConfig,
        authParameters: {
          scope: scopes.join(' '),
        },
      });

      const parameters = new URLSearchParams(url.search);
      expect(parameters.get(QueryKey.Scope)).toBe(
        `${ReservedScope.OpenId} ${UserScope.Profile} organization email`
      );
    });

    it('should be able to append extra query parameters', async () => {
      const extraParams = {
        [QueryKey.State]: 'custom_state',
        [QueryKey.Resource]: 'http://example.com/api',
        [QueryKey.ResponseType]: 'token',
      };

      const url = await getIdpInitiatedSamlSsoSignInUrl(issuer, {
        ...authConfig,
        authParameters: extraParams,
      });

      const parameters = new URLSearchParams(url.search);
      expect(parameters.get(QueryKey.State)).toBe(extraParams[QueryKey.State]);
      expect(parameters.get(QueryKey.Resource)).toBe(extraParams[QueryKey.Resource]);
      expect(parameters.get(QueryKey.ResponseType)).toBe(extraParams[QueryKey.ResponseType]);
    });
  });
});
