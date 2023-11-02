import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { mockSsoConnector as _mockSsoConnector } from '#src/__mocks__/sso.js';

import { SsoProviderName } from '../types/index.js';

import { samlSsoConnectorFactory } from './index.js';

const mockSsoConnector = { ..._mockSsoConnector, providerName: SsoProviderName.SAML };

describe('SamlSsoConnector', () => {
  it('SamlSsoConnector should contains static properties', () => {
    expect(samlSsoConnectorFactory.providerName).toEqual(SsoProviderName.SAML);
    expect(samlSsoConnectorFactory.configGuard).toBeDefined();
  });

  it('constructor should throw error if config is invalid', () => {
    const result = samlSsoConnectorFactory.configGuard.safeParse(mockSsoConnector.config);

    if (result.success) {
      throw new Error('Invalid config');
    }

    const createSamlSsoConnector = () => {
      return new samlSsoConnectorFactory.constructor(mockSsoConnector, 'http://localhost:3001/api');
    };

    expect(createSamlSsoConnector).toThrow(
      new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error)
    );
  });
});
