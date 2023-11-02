import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type SsoConnector } from '@logto/schemas';

import SamlConnector from '../SamlConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { type SingleSignOn, SsoProviderName } from '../types/index.js';
import { samlConnectorConfigGuard } from '../types/saml.js';

/**
 * SAML SSO connector
 *
 * This class extends the basic SAML connector class and add some business related utils methods.
 *
 * @property data The SAML connector data from the database
 *
 * @method getConfig Get parsed SAML config along with it's metadata. Throws error if config is invalid.
 * @method getAuthorizationUrl Get SAML auth URL.
 * @method getUserInfo Get social user info.
 */
export class SamlSsoConnector extends SamlConnector implements SingleSignOn {
  constructor(
    readonly data: SsoConnector,
    tenantId: string
  ) {
    const parseConfigResult = samlConnectorConfigGuard.safeParse(data.config);

    if (!parseConfigResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, parseConfigResult.error);
    }

    super(parseConfigResult.data, tenantId, data.id);
  }

  /**
   * Get parsed SAML connector's config along with it's metadata. Throws error if config is invalid.
   *
   * @returns Parsed SAML connector config and it's metadata.
   */
  async getConfig() {
    return this.getSamlConfig();
  }

  /**
   * Get social user info.
   *
   * @param assertion The SAML assertion from IdP.
   *
   * @returns The social user info extracted from SAML assertion.
   */
  async getUserInfo(assertion: Record<string, unknown>) {
    return this.parseSamlAssertion(assertion);
  }

  /**
   * Get SAML auth URL.
   *
   * @param jti The current session id.
   *
   * @returns The SAML auth URL.
   */
  async getAuthorizationUrl(jti: string) {
    return this.getSingleSignOnUrl(jti);
  }
}

export const samlSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.SAML> = {
  providerName: SsoProviderName.SAML,
  logo: 'saml.svg',
  description: {
    en: ' This connector is used to connect to SAML single sign-on identity provider.',
  },
  configGuard: samlConnectorConfigGuard,
  constructor: SamlSsoConnector,
};
