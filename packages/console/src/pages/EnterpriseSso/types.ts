/**
 * Type definitions for Enterprise SSO guide form, since the type of SAML config is defined in
 * @logto/core and can not be imported here, should align with SAML config types.
 * See {@link @logto/core/packages/core/src/sso/SamlConnector/index.ts}.
 */
import { type SsoProviderName } from '@logto/schemas';

export type AttributeMapping = {
  id?: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
};

export const attributeKeys = Object.freeze([
  'id',
  'email',
  'phone',
  'name',
  'avatar',
]) satisfies ReadonlyArray<keyof AttributeMapping>;

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
