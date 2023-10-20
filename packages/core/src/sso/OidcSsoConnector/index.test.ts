import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { mockSsoConnector } from '#src/__mocks__/sso.js';

import { SsoProviderName } from '../types/index.js';

import OidcSsoConnector from './index.js';

describe('OidcSsoConnector', () => {
  it('OidcSsoConnector should contains static properties', () => {
    expect(OidcSsoConnector.providerName).toEqual(SsoProviderName.OIDC);
    expect(OidcSsoConnector.configGuard).toBeDefined();
  });

  it('constructor should throw error if config is invalid', () => {
    const result = OidcSsoConnector.configGuard.safeParse(mockSsoConnector.config);

    if (result.success) {
      throw new Error('Invalid config');
    }

    const createOidcSsoConnector = () => {
      return new OidcSsoConnector(mockSsoConnector);
    };

    expect(createOidcSsoConnector).toThrow(
      new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error)
    );
  });
});
