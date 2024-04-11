import { SsoProviderName } from '@logto/schemas';

import { azureAdSsoConnectorFactory } from './AzureAdSsoConnector/index.js';
import { azureOidcSsoConnectorFactory } from './AzureOidcSsoConnector/index.js';
import { googleWorkSpaceSsoConnectorFactory } from './GoogleWorkspaceSsoConnector/index.js';
import { oidcSsoConnectorFactory } from './OidcSsoConnector/index.js';
import { oktaSsoConnectorFactory } from './OktaSsoConnector/index.js';
import { samlSsoConnectorFactory } from './SamlSsoConnector/index.js';
import { type SingleSignOnFactory } from './types/index.js';

export { type SingleSignOnConnectorConfig, type SingleSignOnFactory } from './types/index.js';
export * from './types/session.js';

export const ssoConnectorFactories: {
  [key in SsoProviderName]: SingleSignOnFactory<key>;
} = {
  [SsoProviderName.OIDC]: oidcSsoConnectorFactory,
  [SsoProviderName.SAML]: samlSsoConnectorFactory,
  [SsoProviderName.AZURE_AD]: azureAdSsoConnectorFactory,
  [SsoProviderName.AZURE_AD_OIDC]: azureOidcSsoConnectorFactory,
  [SsoProviderName.GOOGLE_WORKSPACE]: googleWorkSpaceSsoConnectorFactory,
  [SsoProviderName.OKTA]: oktaSsoConnectorFactory,
};

export const standardSsoConnectorProviders = Object.freeze([
  SsoProviderName.OIDC,
  SsoProviderName.SAML,
]);
