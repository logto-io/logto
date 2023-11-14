import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { appendPath, pick, type Optional } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import * as saml from 'samlify';
import { z } from 'zod';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { ssoPath } from '#src/routes/interaction/const.js';

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
  getRawSamlMetadata,
  handleSamlAssertion,
  attributeMappingPostProcessor,
  getExtendedUserInfoFromRawUserProfile,
  getEntityIdWith,
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
 * @property _rawSamlIdPMetadata The cached raw SAML metadata (in XML-format) from the raw SAML SSO connector config
 * @property _parsedSamlIdPMetadata The cached parsed SAML metadata from the raw SAML SSO connector config
 *
 * @method getSamlIdPMetadata Parse and return SAML config from the XML-format metadata. Throws error if config is invalid.
 * @method parseSamlAssertion Parse and store the SAML assertion from IdP.
 * @method getSingleSignOnUrl Get the SAML SSO URL.
 * @method getIdpXmlMetadata Get the raw SAML metadata (in XML-format) from the raw SAML SSO connector config.
 */
class SamlConnector {
  readonly assertionConsumerServiceUrl: string;
  readonly entityId: string;
  readonly serviceProviderMetadata: SamlServiceProviderMetadata;

  private _rawSamlIdPMetadata: Optional<string>;
  private _parsedSamlIdPMetadata: Optional<SamlIdentityProviderMetadata>;
  private _identityProvider: Optional<saml.IdentityProviderInstance>;

  constructor(
    private readonly config: SamlConnectorConfig,
    tenantId: string,
    ssoConnectorId: string
  ) {
    this.assertionConsumerServiceUrl = appendPath(
      getTenantEndpoint(tenantId, EnvSet.values),
      `api/authn/${ssoPath}/saml/${ssoConnectorId}`
    ).toString();

    this.entityId = getEntityIdWith(tenantId, ssoConnectorId);

    this.serviceProviderMetadata = {
      entityId: this.entityId,
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
    const identityProvider = await this.getSamlIdPMetadata();
    return { serviceProvider, identityProvider };
  }

  /**
   * Get SAML IdP config along with parsed metadata from raw SAML SSO connector config.
   *
   * @remarks If this function can successfully get the SAML metadata, then it guarantees that the SAML identity provider instance is initiated.
   *
   * @returns Parsed SAML config along with it's parsed metadata.
   */
  async getSamlIdPMetadata(): Promise<SamlIdentityProviderMetadata> {
    if (this._parsedSamlIdPMetadata) {
      return this._parsedSamlIdPMetadata;
    }

    // Get raw SAML metadata ready.
    await this.getIdpXmlMetadata();

    /**
     * Check whether can get raw SAML metadata successfully, if not, then we are expected
     * to get `x509Certificate` and `signInEndpoint` directly from SAML connector config.
     */
    if (this._rawSamlIdPMetadata) {
      const identityProvider = await this.getIdentityProvider();

      const samlIdPMetadata = parseXmlMetadata(identityProvider);
      this._parsedSamlIdPMetadata = {
        // Use `cleanDeep` to remove `undefined` fields since `undefined` type can not be assigned to `Json` type.
        ...cleanDeep(
          pick(this.config, 'metadata', 'metadataUrl', 'signInEndpoint', 'x509Certificate')
        ),
        ...samlIdPMetadata,
      };
      return this._parsedSamlIdPMetadata;
    }

    // Required fields of metadata should not be undefined.
    const result = samlIdentityProviderMetadataGuard.safeParse(this.config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }

    // Simply return `this.config` should be of SamlIdentityProviderMetadata type, but seems the type inference is not that smart.
    this._parsedSamlIdPMetadata = result.data;
    return this._parsedSamlIdPMetadata;
  }

  /**
   * Parse and return the SAML assertion from IdP (with attribute mapping applied).
   *
   * @param assertion The SAML assertion from IdP.
   *
   * @returns The parsed SAML assertion from IdP (with attribute mapping applied).
   */
  async parseSamlAssertion(assertion: Record<string, unknown>): Promise<ExtendedSocialUserInfo> {
    const { x509Certificate } = await this.getSamlIdPMetadata();
    const profileMap = attributeMappingPostProcessor(this.config.attributeMapping);

    const identityProvider = await this.getIdentityProvider();
    const samlAssertionContent = await handleSamlAssertion(assertion, identityProvider, {
      x509Certificate,
      entityId: this.entityId,
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
    const { x509Certificate } = await this.getSamlIdPMetadata();

    try {
      const identityProvider = await this.getIdentityProvider();

      // eslint-disable-next-line new-cap
      const serviceProvider = saml.ServiceProvider({
        entityID: this.entityId,
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
  private async getIdpXmlMetadata() {
    if (this._rawSamlIdPMetadata) {
      return this._rawSamlIdPMetadata;
    }

    const rawSamlMetadata = await getRawSamlMetadata(this.config);
    if (rawSamlMetadata) {
      this._rawSamlIdPMetadata = rawSamlMetadata;
    }

    return this._rawSamlIdPMetadata;
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

    const idpMetadataXml = await this.getIdpXmlMetadata();
    if (idpMetadataXml) {
      // eslint-disable-next-line new-cap
      this._identityProvider = saml.IdentityProvider({
        metadata: idpMetadataXml,
      });
      return this._identityProvider;
    }

    const { signInEndpoint, x509Certificate } = await this.getSamlIdPMetadata();
    // eslint-disable-next-line new-cap
    this._identityProvider = saml.IdentityProvider({
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
