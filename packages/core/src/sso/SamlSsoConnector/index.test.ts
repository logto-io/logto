import { SsoProviderName } from '@logto/schemas';

import { mockSsoConnector as _mockSsoConnector } from '#src/__mocks__/sso.js';
import { getTenantEndpoint, EnvSet } from '#src/env-set/index.js';

import {
  SsoConnectorConfigErrorCodes,
  SsoConnectorError,
  SsoConnectorErrorCodes,
} from '../types/error.js';
import { type SamlConnectorConfig } from '../types/saml.js';

import { samlSsoConnectorFactory } from './index.js';

const mockSsoConnector = { ..._mockSsoConnector, providerName: SsoProviderName.SAML };

describe('SamlSsoConnector', () => {
  it('constructor should work properly', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const createSamlSsoConnector = () =>
      new samlSsoConnectorFactory.constructor(
        mockSsoConnector,
        getTenantEndpoint('default_tenant', EnvSet.values)
      );

    expect(createSamlSsoConnector).not.toThrow();
  });

  it('should get SP config properly without proper IdP config', async () => {
    const temporaryMockSsoConnector = { ...mockSsoConnector, config: { metadata: 123 } };
    const connector = new samlSsoConnectorFactory.constructor(
      temporaryMockSsoConnector,
      getTenantEndpoint('default_tenant', EnvSet.values)
    );

    const { serviceProvider, identityProvider } = await connector.getConfig();
    expect(serviceProvider.entityId).not.toBeUndefined();
    expect(serviceProvider.assertionConsumerServiceUrl).not.toBeUndefined();
    expect(identityProvider).toBeUndefined();
  });

  it('should throw error on calling getIdpMetadata, if the config is invalid', async () => {
    const connector = new samlSsoConnectorFactory.constructor(
      mockSsoConnector,
      getTenantEndpoint('default_tenant', EnvSet.values)
    );

    await expect(async () => connector.getSamlIdpMetadata()).rejects.toThrow(
      new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: undefined,
        message: SsoConnectorConfigErrorCodes.InvalidConnectorConfig,
      })
    );
  });

  it.each([
    { metadata: 'metadata' },
    { metadataUrl: 'https://example.com' },
    {
      entityId: '123',
      signInEndpoint: 'https://example.com',
      x509Certificate: 'mockCert',
    },
  ])('should parse config with %p successfully', (config: SamlConnectorConfig) => {
    const temporaryMockSsoConnector = { ...mockSsoConnector, config };

    const connector = new samlSsoConnectorFactory.constructor(
      temporaryMockSsoConnector,
      getTenantEndpoint('default_tenant', EnvSet.values)
    );

    expect(connector.idpConfig).toEqual(config);
  });
});
