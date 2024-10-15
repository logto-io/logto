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

  it.each([
    ApplicationType.MachineToMachine,
    ApplicationType.Native,
    ApplicationType.Protected,
    ApplicationType.SPA,
  ])(
    'createSsoConnectorIdpInitiatedAuthConfig() should throw 400 if the application type is $s',
    async (type) => {
      findApplicationById.mockResolvedValueOnce({ type, isThirdParty: false });

      await expect(
        ssoConnectorLibrary.createSsoConnectorIdpInitiatedAuthConfig({
          connectorId: 'connectorId',
          defaultApplicationId: 'appId',
        })
      ).rejects.toMatchError(
        new RequestError('connector.saml_idp_initiated_auth_invalid_application_type')
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
      })
    ).rejects.toMatchError(
      new RequestError('connector.saml_idp_initiated_auth_invalid_application_type')
    );

    expect(insertIdpInitiatedAuthConfig).not.toHaveBeenCalled();
  });

  it('should guard the application type if the defaultApplicationId is provided', async () => {
    findApplicationById.mockResolvedValueOnce({
      type: ApplicationType.MachineToMachine,
      isThirdParty: false,
    });

    await expect(
      ssoConnectorLibrary.updateSsoConnectorIdpInitiatedAuthConfig('connectorId', {
        defaultApplicationId: 'appId',
      })
    ).rejects.toMatchError(
      new RequestError('connector.saml_idp_initiated_auth_invalid_application_type')
    );

    expect(updateIdpInitiatedAuthConfig).not.toHaveBeenCalled();
  });

  describe('getIdpInitiatedSamlSsoSignInUrl()', () => {
    const { getIdpInitiatedSamlSsoSignInUrl } = ssoConnectorLibrary;

    const issuer = 'https://example.com/oidc';

    const authConfig: SsoConnectorIdpInitiatedAuthConfig = {
      tenantId: 'tenantId',
      defaultApplicationId: 'appId',
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
