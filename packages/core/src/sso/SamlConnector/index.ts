import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { assert, appendPath, conditional, type Optional } from '@silverhand/essentials';
import * as saml from 'samlify';
import { z } from 'zod';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { ssoPath } from '#src/routes/interaction/const.js';

import {
  type SamlConfig,
  type SamlConnectorConfig,
  samlMetadataGuard,
  type ExtendedSocialUserInfo,
} from '../types/saml.js';

import {
  parseXmlMetadata,
  getRawSamlMetadata,
  handleSamlAssertion,
  attributeMappingPostProcessor,
  getExtendedUserInfoFromRawUserProfile,
} from './utils.js';

/**
 * SAML connector
 *
 * @remark General connector for SAML protocol.
 * This class provides the basic functionality to connect with a SAML IdP.
 * All the SAML single sign-on connector should extend this class.
 *
 * @property config The SAML connector config
 * @property acsUrl The SAML connector's assertion consumer service URL
 * @property _rawSamlMetadata The cached raw SAML metadata (in XML-format) from the raw SAML SSO connector config
 * @property _parsedSamlMetadata The cached parsed SAML metadata from the raw SAML SSO connector config
 * @property _samlAssertionContent The cached parsed SAML assertion from IdP (with attribute mapping applied)
 *
 * @method getSamlConfig Parse and return SAML config from the XML-format metadata. Throws error if config is invalid.
 * @method parseSamlAssertion Parse and store the SAML assertion from IdP.
 * @method getSingleSignOnUrl Get the SAML SSO URL.
 * @method getIdpXmlMetadata Get the raw SAML metadata (in XML-format) from the raw SAML SSO connector config.
 */
class SamlConnector {
  readonly acsUrl: string;
  private _rawSamlMetadata: Optional<string>;
  private _parsedSamlMetadata: Optional<SamlConfig>;

  constructor(
    private readonly config: SamlConnectorConfig,
    tenantId: string,
    ssoConnectorId: string
  ) {
    this.acsUrl = appendPath(
      getTenantEndpoint(tenantId, EnvSet.values),
      `api/authn/${ssoPath}/saml/${ssoConnectorId}`
    ).toString();
  }

  /**
   * Get SAML config along with parsed metadata from raw SAML SSO connector config.
   *
   * @returns Parsed SAML config along with it's parsed metadata.
   */
  async getSamlConfig(): Promise<SamlConfig> {
    if (this._parsedSamlMetadata) {
      return this._parsedSamlMetadata;
    }

    // Get raw SAML metadata ready.
    await this.getIdpXmlMetadata();

    const samlConfig = conditional(
      this._rawSamlMetadata && parseXmlMetadata(this._rawSamlMetadata)
    );

    if (samlConfig) {
      this._parsedSamlMetadata = { ...samlConfig, ...this.config };
      return this._parsedSamlMetadata;
    }

    // Required fields of metadata should not be undefined.
    const result = samlMetadataGuard
      .pick({ signInEndpoint: true, x509Certificate: true, entityId: true })
      .safeParse(this.config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }

    // Simply return `this.config` should be of SamlConfig type, but seems the type inference is not that smart.
    this._parsedSamlMetadata = { ...this.config, ...result.data };
    return this._parsedSamlMetadata;
  }

  /**
   * Parse and return the SAML assertion from IdP (with attribute mapping applied).
   *
   * @param assertion The SAML assertion from IdP.
   *
   * @returns The parsed SAML assertion from IdP (with attribute mapping applied).
   */
  async parseSamlAssertion(assertion: Record<string, unknown>): Promise<ExtendedSocialUserInfo> {
    const parsedConfig = await this.getSamlConfig();
    const profileMap = attributeMappingPostProcessor(parsedConfig.attributeMapping);
    const idpMetadataXml = await this.getIdpXmlMetadata();

    // Add SSO connector errors and replace connector errors.
    assert(
      idpMetadataXml,
      new ConnectorError(ConnectorErrorCodes.InvalidConfig, {
        message: "Can not get identity provider's metadata, please check configuration.",
      })
    );

    const samlAssertionContent = await handleSamlAssertion(assertion, {
      ...parsedConfig,
      idpMetadataXml,
    });

    const userProfileGuard = z.record(z.string().or(z.array(z.string())));
    const rawProfileParseResult = userProfileGuard.safeParse(samlAssertionContent);

    if (!rawProfileParseResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, rawProfileParseResult.error);
    }

    const rawUserProfile = rawProfileParseResult.data;

    return getExtendedUserInfoFromRawUserProfile(rawUserProfile, profileMap);
  }

  /**
   * Get the SSO URL.
   *
   * @param relayState The relay state to be passed to the SAML identity provider. We use it to pass `jti` to find the connector session.
   * @returns The SSO URL.
   */
  async getSingleSignOnUrl(relayState: string) {
    const {
      entityId: entityID,
      x509Certificate,
      nameIdFormat,
      signingAlgorithm,
    } = await this.getSamlConfig();

    try {
      const idpMetadataXml = await this.getIdpXmlMetadata();
      // Add SSO connector errors and replace connector errors.
      assert(
        idpMetadataXml,
        new ConnectorError(ConnectorErrorCodes.InvalidConfig, {
          message: "Can not get identity provider's metadata, please check configuration.",
        })
      );

      // eslint-disable-next-line new-cap
      const identityProvider = saml.IdentityProvider({
        metadata: idpMetadataXml,
      });

      // eslint-disable-next-line new-cap
      const serviceProvider = saml.ServiceProvider({
        entityID, // FIXME: @darcyYe
        relayState,
        nameIDFormat: nameIdFormat,
        signingCert: x509Certificate,
        requestSignatureAlgorithm: signingAlgorithm,
        assertionConsumerService: [
          {
            Location: this.acsUrl,
            Binding: saml.Constants.BindingNamespace.Post,
          },
        ],
      });

      const loginRequest = serviceProvider.createLoginRequest(identityProvider, 'redirect');

      return loginRequest.context;
    } catch (error: unknown) {
      throw new ConnectorError(ConnectorErrorCodes.General, error);
    }
  }

  /**
   * Get the raw SAML metadata (in XML-format) from the raw SAML SSO connector config.
   *
   * @returns The raw SAML metadata in XML-format.
   */
  private async getIdpXmlMetadata() {
    if (this._rawSamlMetadata) {
      return this._rawSamlMetadata;
    }

    const rawSamlMetadata = await getRawSamlMetadata(this.config);
    if (rawSamlMetadata) {
      this._rawSamlMetadata = rawSamlMetadata;
    }
    return this._rawSamlMetadata;
  }
}

export default SamlConnector;
