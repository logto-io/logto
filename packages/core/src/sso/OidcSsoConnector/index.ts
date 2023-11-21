import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type SsoConnector, SsoProviderName } from '@logto/schemas';

import OidcConnector from '../OidcConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { type SingleSignOn } from '../types/index.js';
import { basicOidcConnectorConfigGuard } from '../types/oidc.js';

export class OidcSsoConnector extends OidcConnector implements SingleSignOn {
  constructor(readonly data: SsoConnector) {
    const parseConfigResult = basicOidcConnectorConfigGuard.safeParse(data.config);

    if (!parseConfigResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, parseConfigResult.error);
    }

    super(parseConfigResult.data);
  }

  // OIDC connector doesn't have additional properties.
  // eslint-disable-next-line unicorn/no-useless-undefined
  getProperties = () => undefined;

  async getConfig() {
    return this.getOidcConfig();
  }

  async getIssuer() {
    return this.issuer;
  }
}

export const oidcSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.OIDC> = {
  providerName: SsoProviderName.OIDC,
  logo: 'https://freesvg.org/img/techtonik_OpenID.png',
  description: {
    en: 'This connector is used to connect with OIDC single sign-on identity provider.',
  },
  configGuard: basicOidcConnectorConfigGuard,
  constructor: OidcSsoConnector,
};
