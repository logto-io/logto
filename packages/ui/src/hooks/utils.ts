import { ConnectorData } from '@/types';
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

  if (!isNativeWebview()) {
    for (const connector of socialConnectors) {
      const { platform, target } = connector;

      if (platform === 'Native') {
        continue;
      }

      /**
       * Accepts both web and universal platform connectors.
       * Insert universal connectors only if there is no  web platform connector provided with the same target.
       * Web platform has higher priority.
       **/
      if (platform === 'Web' || !connectorMap.get(target)) {
        connectorMap.set(target, connector);
        continue;
      }
    }

    return Array.from(connectorMap.values());
  }

  for (const connector of socialConnectors) {
    const { platform, target } = connector;

    if (platform === 'Web') {
      continue;
    }

    /**
     * Accepts both Native and universal platform connectors.
     * Insert universal connectors only if there is no  Native platform connector provided with the same target.
     * Native platform has higher priority.
     **/
    if (
      platform === 'Native' &&
      getLogtoNativeSdk()?.supportedSocialConnectorTargets.includes(target)
    ) {
      connectorMap.set(target, connector);
      continue;
    }

    if (platform === 'Universal' && !connectorMap.get(target)) {
      connectorMap.set(target, connector);
      continue;
    }
  }

  return Array.from(connectorMap.values());
};
