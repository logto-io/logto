import { ConnectorData, Platform, SearchParameters } from '@/types';
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
 */

const storageStateKeyPrefix = 'social_auth_state';

export const generateState = () => {
  const uuid = generateRandomString();

  return uuid;
};

export const storeState = (state: string, connectorId: string) => {
  sessionStorage.setItem(`${storageStateKeyPrefix}:${connectorId}`, state);
};

export const stateValidation = (state: string, connectorId: string) => {
  const stateStorage = sessionStorage.getItem(`${storageStateKeyPrefix}:${connectorId}`);

  return stateStorage === state;
};

/**
 * Native Social Redirect Utility Methods
 */
export const storageCallbackLinkKeyPrefix = 'social_callback_data';

export const buildSocialLandingUri = (path: string, redirectTo: string) => {
  const { origin } = window.location;
  const url = new URL(`${origin}${path}`);
  url.searchParams.set(SearchParameters.redirectTo, redirectTo);

  const callbackLink = getLogtoNativeSdk()?.callbackLink;

  if (callbackLink) {
    url.searchParams.set(SearchParameters.nativeCallbackLink, callbackLink);
  }

  return url;
};

export const storeCallbackLink = (connectorId: string, callbackLink: string) => {
  sessionStorage.setItem(`${storageCallbackLinkKeyPrefix}:${connectorId}`, callbackLink);
};

export const getCallbackLinkFromStorage = (connectorId: string) => {
  return sessionStorage.getItem(`${storageCallbackLinkKeyPrefix}:${connectorId}`);
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
