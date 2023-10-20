import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type SsoConnector } from '@logto/schemas';

import OidcConnector from '../OidcConnector/index.js';
import { type SingleSignOn, SsoProviderName } from '../types/index.js';
import { configGuard } from '../types/oidc.js';

class OidcSsoConnector extends OidcConnector implements SingleSignOn {
  static providerName = SsoProviderName.OIDC;
  static configGuard = configGuard;

  constructor(private readonly data: SsoConnector) {
    const parseConfigResult = configGuard.safeParse(data.config);

    if (!parseConfigResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, parseConfigResult.error);
    }

    super(parseConfigResult.data);
  }

  getConfig = async () => this.getOidcConfig();
}

export default OidcSsoConnector;
