import { SsoProviderName } from '@logto/schemas';

import { mockSsoConnector } from '#src/__mocks__/sso.js';

import {
  SsoConnectorError,
  SsoConnectorErrorCodes,
  SsoConnectorConfigErrorCodes,
} from '../types/error.js';

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
      new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: mockSsoConnector.config,
        message: SsoConnectorConfigErrorCodes.InvalidConnectorConfig,
        error: result.error.flatten(),
      })
    );
  });
});
