import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { SsoProviderName } from '@logto/schemas';

import { mockSsoConnector as _mockSsoConnector } from '#src/__mocks__/sso.js';

import { samlSsoConnectorFactory } from './index.js';

const mockSsoConnector = { ..._mockSsoConnector, providerName: SsoProviderName.SAML };

describe('SamlSsoConnector', () => {
  it('SamlSsoConnector should contains static properties', () => {
    expect(samlSsoConnectorFactory.providerName).toEqual(SsoProviderName.SAML);
    expect(samlSsoConnectorFactory.configGuard).toBeDefined();
  });

  it('constructor should work properly', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const createSamlSsoConnector = () =>
      new samlSsoConnectorFactory.constructor(mockSsoConnector, 'default_tenant');

    expect(createSamlSsoConnector).not.toThrow();
  });

  it('constructor should throw error if config is invalid', () => {
    const temporaryMockSsoConnector = { ...mockSsoConnector, config: { metadata: 123 } };
    const result = samlSsoConnectorFactory.configGuard.safeParse(temporaryMockSsoConnector.config);

    if (result.success) {
      throw new Error('Invalid config');
    }

    const createSamlSsoConnector = () => {
      return new samlSsoConnectorFactory.constructor(temporaryMockSsoConnector, 'default_tenant');
    };

    expect(createSamlSsoConnector).toThrow(
      new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error)
    );
  });
});
