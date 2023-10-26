import { type SsoConnector } from '@logto/schemas';

import { ssoConnectorFactories } from './index.js';
import { type SupportedSsoConnector, type SsoProviderName } from './types/index.js';

export const isSupportedSsoProvider = (providerName: string): providerName is SsoProviderName =>
  providerName in ssoConnectorFactories;

export const isSupportedSsoConnector = (
  connector: SsoConnector
): connector is SupportedSsoConnector => isSupportedSsoProvider(connector.providerName);
