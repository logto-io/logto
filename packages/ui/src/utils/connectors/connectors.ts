import { type ConnectorMetadataWithId } from '@/containers/ConnectorSignInList';

import { getLogtoNativeSdk, isNativeWebview } from '../native-sdk';

/**
 * Connectors Filter Utility Methods
 */
export const filterConnectors = (connectors?: ConnectorMetadataWithId[]) => {
  if (!connectors) {
    return [];
  }

  const connectorMap = new Map<string, ConnectorMetadataWithId>();

  /**
   * Browser Environment
   * Accepts both web and universal platform connectors.
   * Insert universal connectors only if there is no web platform connector provided with the same target.
   * Web platform has higher priority.
   **/

  if (!isNativeWebview()) {
    for (const connector of connectors) {
      const { platform, target } = connector;

      if (platform === 'Native') {
        continue;
      }

      if (platform === 'Web' || !connectorMap.get(target)) {
        connectorMap.set(target, connector);
        continue;
      }
    }

    return Array.from(connectorMap.values());
  }

  /**
   * Native Webview Environment
   * Accepts both native and universal platform connectors.
   * Native platform has higher priority.
   **/

  const { supportedConnector, getPostMessage, callbackLink } = getLogtoNativeSdk() ?? {};

  if (!getPostMessage) {
    // Invalid Native SDK bridge injections, not able to sign in with any connector.
    return [];
  }

  for (const connector of connectors) {
    const { platform, target } = connector;

    if (platform === 'Web') {
      continue;
    }

    // Native SupportedConnector Settings is required
    if (!supportedConnector) {
      continue;
    }

    // Native supported nativeTargets flag is required
    if (platform === 'Native' && supportedConnector.nativeTargets.includes(target)) {
      connectorMap.set(target, connector);
      continue;
    }

    /**
     *  Native supportedConnector.universal flag is required
     *  Native callback link settings is required
     *  Only if there is no native platform connector provided with the same target.
     **/
    if (
      platform === 'Universal' &&
      supportedConnector.universal &&
      callbackLink &&
      !connectorMap.get(target)
    ) {
      connectorMap.set(target, connector);
      continue;
    }
  }

  return Array.from(connectorMap.values());
};
