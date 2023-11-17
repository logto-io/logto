import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type Optional } from '@silverhand/essentials';
import * as saml from 'samlify';
import { z } from 'zod';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';

import {
  type SamlConnectorConfig,
  type ExtendedSocialUserInfo,
  type SamlServiceProviderMetadata,
  type SamlMetadata,
  type SamlIdentityProviderMetadata,
  samlIdentityProviderMetadataGuard,
} from '../types/saml.js';

import {
  parseXmlMetadata,
  getSamlMetadataXml,
  handleSamlAssertion,
  attributeMappingPostProcessor,
  getExtendedUserInfoFromRawUserProfile,
  buildSpEntityId,
  buildAssertionConsumerServiceUrl,
} from './utils.js';

/**
 * SAML connector
 *
 * @remark General connector for SAML protocol.
 * This class provides the basic functionality to connect with a SAML IdP.
 * All the SAML single sign-on connector should extend this class.
 *
 * @property config The SAML connector config
 * @property assertionConsumerServiceUrl The SAML connector's assertion consumer service URL {@link file://src/routes/authn.ts}
 * @property _samlIdpMetadataXml The cached raw SAML metadata (in XML-format) from the raw SAML SSO connector config
 *
 * @method getSamlIdpMetadata Parse and return SAML config from the SAML connector config. Throws error if config is invalid.
 * @method parseSamlAssertion Parse and store the SAML assertion from IdP.
 * @method getSingleSignOnUrl Get the SAML SSO URL.
 * @method getIdpMetadataXml Get the raw SAML metadata (in XML-format) from the raw SAML SSO connector config.
 * @method getIdpMetadataJson Get manually configured IdP SAML metadata from the raw SAML SSO connector config.
 */
class SamlConnector {
  private readonly assertionConsumerServiceUrl: string;
  private readonly spEntityId: string;
  private readonly serviceProviderMetadata: SamlServiceProviderMetadata;

  private _samlIdpMetadataXml: Optional<string>;

  private _samlIdpMetadata: Optional<SamlIdentityProviderMetadata>;
  private _identityProvider: Optional<saml.IdentityProviderInstance>;

  constructor(
    private readonly config: SamlConnectorConfig,
    tenantId: string,
    ssoConnectorId: string
  ) {
    this.assertionConsumerServiceUrl = buildAssertionConsumerServiceUrl(
      getTenantEndpoint(tenantId, EnvSet.values),
      ssoConnectorId
    );

    this.spEntityId = buildSpEntityId(EnvSet.values, tenantId, ssoConnectorId);

    this.serviceProviderMetadata = {
      entityId: this.spEntityId,
      assertionConsumerServiceUrl: this.assertionConsumerServiceUrl,
    };
  }

  /**
   * Return parsed SAML metadata.
   *
   * @returns Parsed SAML metadata (contains both SP and IdP metadata).
   */
  async getSamlConfig(): Promise<SamlMetadata> {
    const serviceProvider = this.serviceProviderMetadata;
    const identityProvider = await this.getSamlIdpMetadata();
    return { serviceProvider, identityProvider };
  }

  /**
   * Parse and return the SAML assertion from IdP (with attribute mapping applied).
   *
   * @param assertion The SAML assertion from IdP.
   *
   * @returns The parsed SAML assertion from IdP (with attribute mapping applied).
   */
  async parseSamlAssertion(assertion: Record<string, unknown>): Promise<ExtendedSocialUserInfo> {
    const { x509Certificate } = await this.getSamlIdpMetadata();
    const profileMap = attributeMappingPostProcessor(this.config.attributeMapping);

    const identityProvider = await this.getIdentityProvider();
    const samlAssertionContent = await handleSamlAssertion(assertion, identityProvider, {
      x509Certificate,
      entityId: this.spEntityId,
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
    const { x509Certificate } = await this.getSamlIdpMetadata();
    const identityProvider = await this.getIdentityProvider();

    try {
      // eslint-disable-next-line new-cap
      const serviceProvider = saml.ServiceProvider({
        entityID: this.spEntityId,
        relayState,
        signingCert: x509Certificate,
        authnRequestsSigned: identityProvider.entityMeta.isWantAuthnRequestsSigned(), // Should align with IdP setting.
        assertionConsumerService: [
          {
            Location: this.assertionConsumerServiceUrl,
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
  private async getIdpMetadataXml() {
    if (this._samlIdpMetadataXml) {
      return this._samlIdpMetadataXml;
    }

    this._samlIdpMetadataXml = await getSamlMetadataXml(this.config);
    return this._samlIdpMetadataXml;
  }

  /**
   * Get the manually filled SAML IdP metadata from the raw SAML SSO connector config (including `signInEndpoint` and `x509Certificate`).
   *
   * @returns Manually filled SAML IdP metadata.
   */
  private getIdpMetadataJson() {
    // Required fields of metadata should not be undefined.
    const result = samlIdentityProviderMetadataGuard.safeParse(this.config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }

    return result.data;
  }

  /**
   * Get identity provider constructed using `metadata` got from `config`.
   *
   * @returns Identity provider instance.
   */
  private async getIdentityProvider() {
    if (this._identityProvider) {
      return this._identityProvider;
    }

    const idpMetadataXml = await this.getIdpMetadataXml();
    if (idpMetadataXml) {
      // eslint-disable-next-line new-cap
      this._identityProvider = saml.IdentityProvider({
        metadata: idpMetadataXml,
      });
      return this._identityProvider;
    }

    const idpMetadataJson = this.getIdpMetadataJson();
    const { entityId: entityID, signInEndpoint, x509Certificate } = idpMetadataJson;
    // eslint-disable-next-line new-cap
    this._identityProvider = saml.IdentityProvider({
      entityID,
      signingCert: x509Certificate,
      /**
       * When `metadata` is not provided, `signInEndpoint` and `x509Certificate` are ensured by previous guard.
       * We only support redirect binding for now when sending SAML auth request.
       */
      singleSignOnService: [
        {
          Location: signInEndpoint,
          Binding: saml.Constants.BindingNamespace.Redirect,
        },
      ],
    });
    return this._identityProvider;
  }

  /**
   * Get SAML IdP config along with parsed metadata from raw SAML SSO connector config.
   *
   * @remarks If this function can successfully get the SAML metadata, then it guarantees that the SAML identity provider instance is initiated.
   *
   * @returns Parsed SAML config along with it's parsed metadata.
   */
  private async getSamlIdpMetadata(): Promise<SamlIdentityProviderMetadata> {
    if (this._samlIdpMetadata) {
      return this._samlIdpMetadata;
    }

    const identityProvider = await this.getIdentityProvider();
    this._samlIdpMetadata = parseXmlMetadata(identityProvider);
    return this._samlIdpMetadata;
  }
}

export default SamlConnector;
