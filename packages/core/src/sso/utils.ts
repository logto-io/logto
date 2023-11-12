import type { SsoConnector, SupportedSsoConnector, SsoProviderName } from '@logto/schemas';

import { ssoConnectorFactories } from './index.js';

export const isSupportedSsoProvider = (providerName: string): providerName is SsoProviderName =>
  providerName in ssoConnectorFactories;

export const isSupportedSsoConnector = (
  connector: SsoConnector
): connector is SupportedSsoConnector => isSupportedSsoProvider(connector.providerName);
