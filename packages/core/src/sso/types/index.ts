import { type I18nPhrases } from '@logto/connector-kit';
import { type SsoProviderType, type SsoProviderName } from '@logto/schemas';

import { type AzureAdSsoConnector } from '../AzureAdSsoConnector/index.js';
import { type AzureOidcSsoConnector } from '../AzureOidcSsoConnector/index.js';
import {
  type googleWorkspaceSsoConnectorConfigGuard,
  type GoogleWorkspaceSsoConnector,
} from '../GoogleWorkspaceSsoConnector/index.js';
import { type OidcSsoConnector } from '../OidcSsoConnector/index.js';
import { type OktaSsoConnector } from '../OktaSsoConnector/index.js';
import { type SamlSsoConnector } from '../SamlSsoConnector/index.js';

import { type basicOidcConnectorConfigGuard } from './oidc.js';
import { type samlConnectorConfigGuard } from './saml.js';

type SingleSignOnConstructor = {
  [SsoProviderName.OIDC]: typeof OidcSsoConnector;
  [SsoProviderName.SAML]: typeof SamlSsoConnector;
  [SsoProviderName.AZURE_AD]: typeof AzureAdSsoConnector;
  [SsoProviderName.GOOGLE_WORKSPACE]: typeof GoogleWorkspaceSsoConnector;
  [SsoProviderName.OKTA]: typeof OktaSsoConnector;
  [SsoProviderName.AZURE_AD_OIDC]: typeof AzureOidcSsoConnector;
};

export type SingleSignOnConnectorConfig = {
  [SsoProviderName.OIDC]: typeof basicOidcConnectorConfigGuard;
  [SsoProviderName.SAML]: typeof samlConnectorConfigGuard;
  [SsoProviderName.AZURE_AD]: typeof samlConnectorConfigGuard;
  [SsoProviderName.GOOGLE_WORKSPACE]: typeof googleWorkspaceSsoConnectorConfigGuard;
  [SsoProviderName.OKTA]: typeof basicOidcConnectorConfigGuard;
  [SsoProviderName.AZURE_AD_OIDC]: typeof basicOidcConnectorConfigGuard;
};

export type SingleSignOnFactory<T extends SsoProviderName> = {
  providerName: T;
  providerType: SsoProviderType;
  logo: string;
  logoDark: string;
  description: I18nPhrases;
  name: I18nPhrases; // This `name` is for console and experience display use, while `providerName` is for internal use.
  configGuard: SingleSignOnConnectorConfig[T];
  constructor: SingleSignOnConstructor[T];
};
