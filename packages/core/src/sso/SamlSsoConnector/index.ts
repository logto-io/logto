import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type SsoConnector } from '@logto/schemas';

import SamlConnector from '../SamlConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { type SingleSignOn, SsoProviderName } from '../types/index.js';
import { baseSamlConnectorConfigGuard } from '../types/saml.js';

export class SamlSsoConnector extends SamlConnector implements SingleSignOn {
  constructor(
    private readonly _data: SsoConnector,
    tenantId: string
  ) {
    const parseConfigResult = baseSamlConnectorConfigGuard.safeParse(_data.config);

    if (!parseConfigResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, parseConfigResult.error);
    }

    super(parseConfigResult.data, tenantId, _data.id);
  }

  get data() {
    return this._data;
  }

  getConfig = async () => this.getSamlConfig();
}

export const samlSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.SAML> = {
  providerName: SsoProviderName.SAML,
  logo: 'saml.svg',
  description: {
    en: ' This connector is used to connect to SAML single sign-on identity provider.',
  },
  configGuard: baseSamlConnectorConfigGuard,
  constructor: SamlSsoConnector,
};
