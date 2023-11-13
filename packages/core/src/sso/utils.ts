import type { SsoConnector } from '@logto/schemas';

import type { SupportedSsoConnector, SsoProviderName } from '#src/sso/types/index.js';

import { ssoConnectorFactories } from './index.js';

export const isSupportedSsoProvider = (providerName: string): providerName is SsoProviderName =>
  providerName in ssoConnectorFactories;

export const isSupportedSsoConnector = (
  connector: SsoConnector
): connector is SupportedSsoConnector => isSupportedSsoProvider(connector.providerName);
