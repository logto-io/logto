import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { SsoProviderName } from '@logto/schemas';

import { mockSsoConnector } from '#src/__mocks__/sso.js';

import { oidcSsoConnectorFactory } from './index.js';

describe('OidcSsoConnector', () => {
  it('OidcSsoConnector should contains static properties', () => {
    expect(oidcSsoConnectorFactory.providerName).toEqual(SsoProviderName.OIDC);
    expect(oidcSsoConnectorFactory.configGuard).toBeDefined();
  });

  it('constructor should throw error if config is invalid', () => {
    const result = oidcSsoConnectorFactory.configGuard.safeParse(mockSsoConnector.config);

    if (result.success) {
      throw new Error('Invalid config');
    }

    const createOidcSsoConnector = () => {
      return new oidcSsoConnectorFactory.constructor(mockSsoConnector);
    };

    expect(createOidcSsoConnector).toThrow(
      new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error)
    );
  });
});
