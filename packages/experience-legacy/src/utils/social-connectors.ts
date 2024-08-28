import { GoogleConnector } from '@logto/connector-kit';
import type { ExperienceSocialConnector } from '@logto/schemas';
import { ConnectorPlatform } from '@logto/schemas';
import { getCookie } from 'tiny-cookie';

import { SearchParameters } from '@/types';
import { generateRandomString } from '@/utils';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';

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

/**
 * Validate the state parameter from the social connector callback. If the state parameter is empty
 * or invalid, it will return false.
 */
export const validateState = (state: string | undefined, connectorId: string): boolean => {
  if (!state) {
    return false;
  }

  const storageKey = `${storageStateKeyPrefix}:${connectorId}`;
  const stateStorage = sessionStorage.getItem(storageKey);
  sessionStorage.removeItem(storageKey);

  return stateStorage === state;
};

export const validateGoogleOneTapCsrfToken = (csrfToken?: string): boolean =>
  Boolean(csrfToken && getCookie(GoogleConnector.oneTapParams.csrfToken) === csrfToken);

/**
 * Native Social Redirect Utility Methods
 */
export const storageCallbackLinkKeyPrefix = 'social_callback_data';

export const buildSocialLandingUri = (path: string, redirectTo: string) => {
  const { origin } = window.location;
  const url = new URL(`${origin}${path}`);
  url.searchParams.set(SearchParameters.RedirectTo, redirectTo);

  const callbackLink = getLogtoNativeSdk()?.callbackLink;

  if (callbackLink) {
    url.searchParams.set(SearchParameters.NativeCallbackLink, callbackLink);
  }

  return url;
};

export const storeCallbackLink = (connectorId: string, callbackLink: string) => {
  sessionStorage.setItem(`${storageCallbackLinkKeyPrefix}:${connectorId}`, callbackLink);
};

export const getCallbackLinkFromStorage = (connectorId: string) => {
  return sessionStorage.getItem(`${storageCallbackLinkKeyPrefix}:${connectorId}`);
};

export const removeCallbackLinkFromStorage = (connectorId: string) => {
  sessionStorage.removeItem(`${storageCallbackLinkKeyPrefix}:${connectorId}`);
};

/**
 * Social Connectors Filter Utility Methods
 */
export const filterSocialConnectors = (socialConnectors?: ExperienceSocialConnector[]) => {
  if (!socialConnectors) {
    return [];
  }

  const connectorMap = new Map<string, ExperienceSocialConnector>();

  /**
   * Browser Environment
   * Accepts both web and universal platform connectors.
   * Insert universal connectors only if there is no web platform connector provided with the same target.
   * Web platform has higher priority.
   **/

  if (!isNativeWebview()) {
    for (const connector of socialConnectors) {
      const { platform, target } = connector;

      if (platform === ConnectorPlatform.Native) {
        continue;
      }

      if (platform === ConnectorPlatform.Web || !connectorMap.get(target)) {
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
    // Invalid Native SDK bridge injections, not able to sign in with any social connectors.
    return [];
  }

  for (const connector of socialConnectors) {
    const { platform, target } = connector;

    if (platform === ConnectorPlatform.Web) {
      continue;
    }

    // Native SupportedConnector Settings is required
    if (!supportedConnector) {
      continue;
    }

    // Native supported nativeTargets flag is required
    if (
      platform === ConnectorPlatform.Native &&
      supportedConnector.nativeTargets.includes(target)
    ) {
      connectorMap.set(target, connector);
      continue;
    }

    /**
     *  Native supportedConnector.universal flag is required
     *  Native callback link settings is required
     *  Only if there is no native platform connector provided with the same target.
     **/
    if (
      platform === ConnectorPlatform.Universal &&
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

/**
 * Social Connectors Filter Utility Methods used in preview mode only
 */
export const filterPreviewSocialConnectors = (
  platform: ConnectorPlatform.Native | ConnectorPlatform.Web,
  socialConnectors?: ExperienceSocialConnector[]
) => {
  if (!socialConnectors) {
    return [];
  }

  const connectorMap = new Map<string, ExperienceSocialConnector>();

  /**
   * Browser Environment
   * Accepts both web and universal platform connectors.
   * Insert universal connectors only if there is no web platform connector provided with the same target.
   * Web platform has higher priority.
   **/

  if (platform === ConnectorPlatform.Web) {
    for (const connector of socialConnectors) {
      const { platform, target } = connector;

      if (platform === ConnectorPlatform.Native) {
        continue;
      }

      if (platform === ConnectorPlatform.Web || !connectorMap.get(target)) {
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

    if (platform === ConnectorPlatform.Web) {
      continue;
    }

    if (platform === ConnectorPlatform.Native || !connectorMap.get(target)) {
      connectorMap.set(target, connector);
      continue;
    }
  }

  return Array.from(connectorMap.values());
};

export const isAppleConnector = (target?: string) => target === 'apple';
