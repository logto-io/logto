import { type I18nPhrases } from '@logto/connector-kit';
import { SsoProviderName } from '@logto/schemas';

import {
  type AzureAdSsoConnector,
  azureAdSsoConnectorFactory,
} from './AzureAdSsoConnector/index.js';
import {
  type GoogleWorkspaceSsoConnector,
  googleWorkSpaceSsoConnectorFactory,
  type googleWorkspaceSsoConnectorConfigGuard,
} from './GoogleWorkspaceSsoConnector/index.js';
import { oidcSsoConnectorFactory, type OidcSsoConnector } from './OidcSsoConnector/index.js';
import { type SamlSsoConnector, samlSsoConnectorFactory } from './SamlSsoConnector/index.js';
import { type basicOidcConnectorConfigGuard } from './types/oidc.js';
import { type samlConnectorConfigGuard } from './types/saml.js';

type SingleSignOnConstructor = {
  [SsoProviderName.OIDC]: typeof OidcSsoConnector;
  [SsoProviderName.SAML]: typeof SamlSsoConnector;
  [SsoProviderName.AZURE_AD]: typeof AzureAdSsoConnector;
  [SsoProviderName.GOOGLE_WORKSPACE]: typeof GoogleWorkspaceSsoConnector;
};

type SingleSignOnConnectorConfig = {
  [SsoProviderName.OIDC]: typeof basicOidcConnectorConfigGuard;
  [SsoProviderName.SAML]: typeof samlConnectorConfigGuard;
  [SsoProviderName.AZURE_AD]: typeof samlConnectorConfigGuard;
  [SsoProviderName.GOOGLE_WORKSPACE]: typeof googleWorkspaceSsoConnectorConfigGuard;
};

export type SingleSignOnFactory<T extends SsoProviderName> = {
  providerName: T;
  logo: string;
  description: I18nPhrases;
  configGuard: SingleSignOnConnectorConfig[T];
  constructor: SingleSignOnConstructor[T];
};

export const ssoConnectorFactories: {
  [key in SsoProviderName]: SingleSignOnFactory<key>;
} = {
  [SsoProviderName.OIDC]: oidcSsoConnectorFactory,
  [SsoProviderName.SAML]: samlSsoConnectorFactory,
  [SsoProviderName.AZURE_AD]: azureAdSsoConnectorFactory,
  [SsoProviderName.GOOGLE_WORKSPACE]: googleWorkSpaceSsoConnectorFactory,
};

export const standardSsoConnectorProviders = Object.freeze([
  SsoProviderName.OIDC,
  SsoProviderName.SAML,
]);
