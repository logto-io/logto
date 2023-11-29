/**
 * Type definitions for Enterprise SSO guide form, since the type of SAML config is defined in
 * @logto/core and can not be imported here, should align with SAML config types.
 * See {@link @logto/core/packages/core/src/sso/SamlConnector/index.ts}.
 */
import { type SsoProviderName, type SsoConnectorWithProviderConfig } from '@logto/schemas';

type AttributeMapping = {
  id?: string;
  email?: string;
  name?: string;
};

export const attributeKeys = Object.freeze(['id', 'email', 'name']) satisfies ReadonlyArray<
  keyof AttributeMapping
>;

export type SamlGuideFormType = {
  metadataUrl?: string;
  metadata?: string;
  signInEndpoint?: string;
  entityId?: string;
  x509Certificate?: string;
  attributeMapping?: AttributeMapping;
};

export type OidcGuideFormType = {
  clientId?: string;
  clientSecret?: string;
  issuer?: string;
  scope?: string;
};

export type GuideFormType<T extends SsoProviderName> = T extends SsoProviderName.OIDC
  ? OidcGuideFormType
  : T extends SsoProviderName.SAML
  ? SamlGuideFormType
  : never;

/**
 * This type aligned with the type of `SamlIdentityProviderMetadata` (packages/core/src/sso/types/saml.ts)
 * and `OidcConfigResponse` (packages/core/src/sso/types/oidc.ts).
 *
 * Since these types are defined in @logto/core, we can't import them directly here.
 */
export type ParsedSsoIdentityProviderConfig<T extends SsoProviderName> =
  T extends SsoProviderName.OIDC
    ? {
        authorizationEndpoint: string;
        tokenEndpoint: string;
        userinfoEndpoint: string;
        jwksUri: string;
        issuer: string;
      }
    : T extends SsoProviderName.SAML
    ? {
        defaultAttributeMapping: AttributeMapping;
        serviceProvider: {
          entityId: string;
          assertionConsumerServiceUrl: string;
        };
        identityProvider?: {
          entityId: string;
          signInEndpoint: string;
          x509Certificate: string;
          expiresAt: number;
          isValid: boolean;
        };
      }
    : never;

export type SsoConnectorConfig<T extends SsoProviderName> = GuideFormType<T>;

// Help the Guide component type to be inferred from the connector's type.
export type SsoConnectorWithProviderConfigWithGeneric<T extends SsoProviderName> = Omit<
  SsoConnectorWithProviderConfig,
  'config' | 'providerName' | 'providerConfig'
> & {
  providerName: T;
  providerConfig?: ParsedSsoIdentityProviderConfig<T>;
  config: SsoConnectorConfig<T>;
};
