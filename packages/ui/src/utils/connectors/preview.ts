import { ConnectorPlatform } from '@logto/connector-kit';

import { type ConnectorMetadataWithId } from '@/containers/ConnectorSignInList';

/**
 * Connectors Filter Utility Methods used in preview mode only
 */
export const filterPreviewConnectors = (
  platform: ConnectorPlatform.Native | ConnectorPlatform.Web,
  connectors?: ConnectorMetadataWithId[]
) => {
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

  if (platform === ConnectorPlatform.Web) {
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
   * Insert universal connectors only if there is no native platform connector provided with the same target.
   * Native platform has higher priority.
   **/

  for (const connector of connectors) {
    const { platform, target } = connector;

    if (platform === 'Web') {
      continue;
    }

    if (platform === 'Native' || !connectorMap.get(target)) {
      connectorMap.set(target, connector);
      continue;
    }
  }

  return Array.from(connectorMap.values());
};
