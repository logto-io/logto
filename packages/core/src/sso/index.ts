import { type I18nPhrases } from '@logto/connector-kit';
import { type ZodType } from 'zod';

import { oidcSsoConnectorFactory, type OidcSsoConnector } from './OidcSsoConnector/index.js';
import { SsoProviderName } from './types/index.js';

type SingleSignOnConstructor<T extends SsoProviderName> = T extends SsoProviderName.OIDC
  ? typeof OidcSsoConnector
  : never;

export type SingleSignOnFactory<T extends SsoProviderName> = {
  providerName: T;
  logo: string;
  description: I18nPhrases;
  configGuard: ZodType;
  constructor: SingleSignOnConstructor<T>;
};

const ssoConnectorFactories: {
  [key in SsoProviderName]: SingleSignOnFactory<key>;
} = {
  [SsoProviderName.OIDC]: oidcSsoConnectorFactory,
};
