import { type I18nPhrases } from '@logto/connector-kit';

import { oidcSsoConnectorFactory, type OidcSsoConnector } from './OidcSsoConnector/index.js';
import { type SamlSsoConnector, samlSsoConnectorFactory } from './SamlSsoConnector/index.js';
import { SsoProviderName } from './types/index.js';
import { type basicOidcConnectorConfigGuard } from './types/oidc.js';
import { type samlConnectorConfigGuard } from './types/saml.js';

type SingleSignOnConstructor<T extends SsoProviderName> = T extends SsoProviderName.OIDC
  ? typeof OidcSsoConnector
  : T extends SsoProviderName.SAML
  ? typeof SamlSsoConnector
  : never;

type SingleSignOnConnectorConfig<T extends SsoProviderName> = T extends SsoProviderName.OIDC
  ? typeof basicOidcConnectorConfigGuard
  : T extends SsoProviderName.SAML
  ? typeof samlConnectorConfigGuard
  : never;

export type SingleSignOnFactory<T extends SsoProviderName> = {
  providerName: T;
  logo: string;
  description: I18nPhrases;
  configGuard: SingleSignOnConnectorConfig<T>;
  constructor: SingleSignOnConstructor<T>;
};

export const ssoConnectorFactories: {
  [key in SsoProviderName]: SingleSignOnFactory<key>;
} = {
  [SsoProviderName.OIDC]: oidcSsoConnectorFactory,
  [SsoProviderName.SAML]: samlSsoConnectorFactory,
};

export const standardSsoConnectorProviders = Object.freeze([
  SsoProviderName.OIDC,
  SsoProviderName.SAML,
]);
