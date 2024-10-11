import { type SsoSamlAssertionContent } from '@logto/schemas';
import { conditional, type Optional } from '@silverhand/essentials';
import { XMLValidator } from 'fast-xml-parser';
import * as saml from 'samlify';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';

import {
  SsoConnectorConfigErrorCodes,
  SsoConnectorError,
  SsoConnectorErrorCodes,
} from '../types/error.js';
import {
  type SamlConnectorConfig,
  type ExtendedSocialUserInfo,
  type SamlServiceProviderMetadata,
  type SamlIdentityProviderMetadata,
  manualSamlConnectorConfigGuard,
} from '../types/saml.js';

import {
  parseXmlMetadata,
  fetchSamlMetadataXml,
  handleSamlAssertion,
  getExtendedUserInfoFromRawUserProfile,
  buildSpEntityId,
  buildAssertionConsumerServiceUrl,
  attributeMappingPostProcessor,
} from './utils.js';

/**
 * SAML connector
 *
 * @remark General connector for SAML protocol.
 * This class provides the basic functionality to connect with a SAML IdP.
 * All the SAML single sign-on connector should extend this class.
 *
 * @property _idpConfig The input SAML connector config
 * @property idpConfig The parsed SAML connector config, throws error if _idpConfig input is invalid
 * @property serviceProviderMetadata The SAML service provider metadata
 * @property serviceProviderMetadata.assertionConsumerServiceUrl The SAML connector's SP assertion consumer service URL {@link file://src/routes/authn.ts}
 * @property serviceProviderMetadata.entityId spEntityId
 *
 * @property _samlIdpMetadata The parsed SAML IdP metadata cache from the SAML IdP instance
 * @property _identityProvider The SAML identity provider instance cache
 *
 * @method getSamlIdpMetadata Parse and return SAML config from the SAML connector config. Throws error if config is invalid.
 * @method getUserInfoFromSamlAssertion Parse and store the SAML assertion from IdP.
 * @method getSingleSignOnUrl Get the SAML SSO URL.
 * @method getIdpMetadataXml Get the raw SAML metadata (in XML-format) from the raw SAML SSO connector config.
 * @method getIdpMetadataJson Get manually configured IdP SAML metadata from the raw SAML SSO connector config.
 */
class SamlConnector {
  readonly serviceProviderMetadata: SamlServiceProviderMetadata;

  private _samlIdpMetadata: Optional<SamlIdentityProviderMetadata>;
  private _identityProvider: Optional<saml.IdentityProviderInstance>;

  // Allow _idpConfig input to be undefined when constructing the connector.
  constructor(
    tenantId: string,
    ssoConnectorId: string,
    private readonly _idpConfig: SamlConnectorConfig | undefined
  ) {
    const tenantEndpoint = getTenantEndpoint(tenantId, EnvSet.values);

    const assertionConsumerServiceUrl = buildAssertionConsumerServiceUrl(
      tenantEndpoint,
      ssoConnectorId
    );

    const spEntityId = buildSpEntityId(tenantEndpoint, ssoConnectorId);

    this.serviceProviderMetadata = {
      entityId: spEntityId,
      assertionConsumerServiceUrl,
    };
  }

  /**
   *
   * @remarks
   * Since the SP config does not depend on the connector config,
   * we allow the idpConfig to be undefined when constructing the connector.
   *
   * However, the connector config is required when getting the SAML IdP metadata.
   * Therefore, we provide a getter to get the valid SAML connector config.
   */
  get idpConfig() {
    if (!this._idpConfig) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: this._idpConfig,
        message: SsoConnectorConfigErrorCodes.InvalidConnectorConfig,
      });
    }

    return this._idpConfig;
  }

  /**
   * Parse the SAML assertion content received from IdP.
   *
   * @param body The raw SAML assertion request body received from IdP.
   * @throws {SsoConnectorError} If the SAML assertion is invalid or cannot be parsed.
   */
  async parseSamlAssertionContent(body: Record<string, unknown>) {
    const identityProvider = await this.getIdentityProvider();
    const { x509Certificate } = await this.getSamlIdpMetadata();

    // HandleSamlAssertion takes a HTTPResponse-like object, need to wrap body in a object.
    const samlAssertionContent = await handleSamlAssertion({ body }, identityProvider, {
      x509Certificate,
      entityId: this.serviceProviderMetadata.entityId,
    });

    return samlAssertionContent;
  }

  /**
   * Extract the user info from the SAML assertion received from IdP. (with attribute mapping applied).
   *
   * @param body The raw SAML assertion request body received from IdP.
   *
   * @returns {ExtendedSocialUserInfo} The parsed social user info (with attribute mapping applied).
   */
  getUserInfoFromSamlAssertion(
    samlAssertionContent: SsoSamlAssertionContent
  ): ExtendedSocialUserInfo {
    const rawUserProfile: Record<string, unknown> = {
      ...conditional(samlAssertionContent.nameID && { nameID: samlAssertionContent.nameID }),
      ...samlAssertionContent.attributes,
    };

    const profileMap = attributeMappingPostProcessor(this.idpConfig.attributeMapping);

    return getExtendedUserInfoFromRawUserProfile(rawUserProfile, profileMap);
  }

  /**
   * Get the SSO URL.
   *
   * @param relayState The relay state to be passed to the SAML identity provider. We use it to pass `jti` to find the connector session.
   * @returns The SSO URL.
   */
  async getSingleSignOnUrl(relayState: string) {
    const identityProvider = await this.getIdentityProvider();
    const { x509Certificate } = await this.getSamlIdpMetadata();
    const { entityId, assertionConsumerServiceUrl } = this.serviceProviderMetadata;

    try {
      // eslint-disable-next-line new-cap
      const serviceProvider = saml.ServiceProvider({
        entityID: entityId,
        relayState,
        signingCert: x509Certificate,
        authnRequestsSigned: identityProvider.entityMeta.isWantAuthnRequestsSigned(), // Should align with IdP setting.
        assertionConsumerService: [
          {
            Location: assertionConsumerServiceUrl,
            Binding: saml.Constants.BindingNamespace.Post,
          },
        ],
      });

      const loginRequest = serviceProvider.createLoginRequest(identityProvider, 'redirect');

      return loginRequest.context;
    } catch (error: unknown) {
      if (error instanceof SsoConnectorError) {
        throw error;
      }

      throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidMetadata, {
        message: SsoConnectorConfigErrorCodes.InvalidConnectorConfig,
        error,
      });
    }
  }

  /**
   * Get SAML IdP config along with parsed metadata from raw SAML SSO connector config.
   *
   * @remarks If this function can successfully get the SAML metadata, then it guarantees that the SAML identity provider instance is initiated.
   *
   * @returns Parsed SAML config along with it's parsed metadata.
   */
  async getSamlIdpMetadata(): Promise<SamlIdentityProviderMetadata> {
    if (this._samlIdpMetadata) {
      return this._samlIdpMetadata;
    }

    const identityProvider = await this.getIdentityProvider();

    this._samlIdpMetadata = parseXmlMetadata(identityProvider);

    return this._samlIdpMetadata;
  }

  /**
   * Get the raw SAML metadata (in XML-format) from the raw SAML SSO connector config.
   *
   * @returns The raw SAML metadata in XML-format.
   */
  private async getIdpMetadataXml() {
    if ('metadataUrl' in this.idpConfig) {
      return fetchSamlMetadataXml(this.idpConfig.metadataUrl);
    }

    if ('metadata' in this.idpConfig) {
      return this.idpConfig.metadata;
    }
  }

  /**
   * Get the manually filled SAML IdP metadata from the raw SAML SSO connector config (including `signInEndpoint` and `x509Certificate`).
   *
   * @returns Manually filled SAML IdP metadata.
   */
  private getIdpMetadataJson() {
    // Required fields of metadata should not be undefined.
    const result = manualSamlConnectorConfigGuard.safeParse(this.idpConfig);

    if (!result.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: this.idpConfig,
        message: SsoConnectorConfigErrorCodes.InvalidConnectorConfig,
        error: result.error.flatten(),
      });
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

    // If `metadataUrl` or `metadata` is provided, we use it to construct the identity provider.
    const idpMetadataXml = await this.getIdpMetadataXml();

    if (idpMetadataXml) {
      // Samlify validator swallows the error, validate the XML metadata on our own.
      // Other appearance of SAML metadata validator is using '@authenio/samlify-node-xmllint',
      // but this validator failed to resolve a valid XML file. Align the use of validator later on.
      try {
        XMLValidator.validate(idpMetadataXml, {
          allowBooleanAttributes: true,
        });
      } catch (error: unknown) {
        throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidMetadata, {
          message: SsoConnectorConfigErrorCodes.InvalidSamlXmlMetadata,
          metadata: idpMetadataXml,
          error,
        });
      }

      this._identityProvider =
        // eslint-disable-next-line new-cap
        saml.IdentityProvider({
          metadata: idpMetadataXml,
        });
      return this._identityProvider;
    }

    // If `metadataUrl` and `metadata` are not provided, we use get metadata from the idpConfig directly
    const { entityId: entityID, signInEndpoint, x509Certificate } = this.getIdpMetadataJson();

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
}

export default SamlConnector;
