import { ConnectorData, Platform } from '@/types';
import { generateRandomString } from '@/utils';

/**
 * Native SDK Utility Methods
 */
export const getLogtoNativeSdk = () => {
  if (typeof logtoNativeSdk !== 'undefined') {
    return logtoNativeSdk;
  }
};

export const isNativeWebview = () => {
  const platform = getLogtoNativeSdk()?.platform ?? '';

  return ['ios', 'android'].includes(platform);
};

/**
 * Social Connector State Utility Methods
 * @param state
 * @param state.uuid - unique id
 * @param state.platform - platform
 * @param state.callbackLink - callback uri scheme
 */

type State = {
  uuid: string;
  platform: 'web' | 'ios' | 'android';
  callbackLink?: string;
};

const storageKeyPrefix = 'social_auth_state';

export const generateState = () => {
  const uuid = generateRandomString();
  const platform = getLogtoNativeSdk()?.platform ?? 'web';
  const callbackLink = getLogtoNativeSdk()?.callbackLink;

  const state: State = { uuid, platform, callbackLink };

  return btoa(JSON.stringify(state));
};

export const decodeState = (state: string) => {
  try {
    return JSON.parse(atob(state)) as State;
  } catch {}
};

export const stateValidation = (state: string, connectorId: string) => {
  const stateStorage = sessionStorage.getItem(`${storageKeyPrefix}:${connectorId}`);

  return stateStorage === state;
};

export const storeState = (state: string, connectorId: string) => {
  sessionStorage.setItem(`${storageKeyPrefix}:${connectorId}`, state);
};

/**
 * Social Connectors Filter Utility Methods
 */
export const filterSocialConnectors = (socialConnectors?: ConnectorData[]) => {
  if (!socialConnectors) {
    return [];
  }

  const connectorMap = new Map<string, ConnectorData>();

  /**
   * Browser Environment
   * Accepts both web and universal platform connectors.
   * Insert universal connectors only if there is no web platform connector provided with the same target.
   * Web platform has higher priority.
   **/

  if (!isNativeWebview()) {
    for (const connector of socialConnectors) {
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

  for (const connector of socialConnectors) {
    const { platform, target } = connector;

    if (platform === 'Web') {
      continue;
    }

    const { supportedConnector } = getLogtoNativeSdk() ?? {};

    // No native supportedConnector settings found
    if (!supportedConnector) {
      continue;
    }

    if (platform === 'Native' && supportedConnector.nativeTargets.includes(target)) {
      connectorMap.set(target, connector);
      continue;
    }

    if (platform === 'Universal' && supportedConnector.universal && !connectorMap.get(target)) {
      connectorMap.set(target, connector);
      continue;
    }
  }

  return Array.from(connectorMap.values());
};

/**
 * Social Connectors Filter Utility Methods used in preview mode only
 */
export const filterPreviewSocialConnectors = (
  previewPlatform: Platform,
  socialConnectors?: ConnectorData[]
) => {
  if (!socialConnectors) {
    return [];
  }

  const connectorMap = new Map<string, ConnectorData>();

  /**
   * Browser Environment
   * Accepts both web and universal platform connectors.
   * Insert universal connectors only if there is no web platform connector provided with the same target.
   * Web platform has higher priority.
   **/

  if (previewPlatform === 'web') {
    for (const connector of socialConnectors) {
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

  for (const connector of socialConnectors) {
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
