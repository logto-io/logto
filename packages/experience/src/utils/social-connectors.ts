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

/**
 * Get a value from storage with localStorage fallback.
 *
 * Some in-app browsers (e.g. WeChat, Facebook) clear sessionStorage when a redirect
 * opens a new view or window. To handle this, we also persist values in localStorage
 * and fall back to it when sessionStorage is empty after a redirect.
 */
const getStorageItem = (key: string): string | null => {
  const sessionValue = sessionStorage.getItem(key);

  if (sessionValue !== null) {
    return sessionValue;
  }

  // Fallback: try localStorage (may have been set before the redirect)
  const localValue = localStorage.getItem(key);

  if (localValue !== null) {
    // Restore to sessionStorage for consistency and remove the fallback copy
    sessionStorage.setItem(key, localValue);
    localStorage.removeItem(key);
  }

  return localValue;
};

/**
 * Set a value in both sessionStorage and localStorage.
 *
 * Writing to localStorage ensures data survives in in-app browsers that clear
 * sessionStorage during cross-window redirects.
 */
const setStorageItem = (key: string, value: string): void => {
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
};

/**
 * Remove a value from both sessionStorage and localStorage.
 */
const removeStorageItem = (key: string): void => {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

export const storeState = (state: string, connectorId: string) => {
  setStorageItem(`${storageStateKeyPrefix}:${connectorId}`, state);
};

const deleteState = (connectorId: string) => {
  const storageKey = `${storageStateKeyPrefix}:${connectorId}`;
  removeStorageItem(storageKey);
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
  const stateStorage = getStorageItem(storageKey);
  deleteState(connectorId);

  return stateStorage === state;
};

const validateGoogleOneTapCsrfToken = (csrfToken?: string): boolean =>
  Boolean(csrfToken && getCookie(GoogleConnector.oneTapParams.csrfToken) === csrfToken);

/**
 * Validate authentication parameters based on different scenarios:
 * 1. Normal social login: requires valid state parameter for CSRF protection
 * 2. Google One Tap from external website: no validation needed (already verified by Google)
 * 3. Google One Tap from Experience app: validate CSRF token if present
 *
 * @param isGoogleOneTap - Whether the login is Google One Tap
 * @param connectorId - The connector id
 * @param isExternalCredential - Whether the login is from external website Google One Tap
 * @param params - The parameters to validate
 * @param state - The state parameter to validate
 * @returns Whether the authentication parameters are valid
 */
export const getAuthValidationResult = ({
  isGoogleOneTap,
  connectorId,
  isExternalCredential,
  params,
  state,
}: {
  isGoogleOneTap: boolean;
  connectorId: string;
  isExternalCredential: boolean;
  params: Record<string, string>;
  state?: string;
}): boolean => {
  if (!isGoogleOneTap) {
    // Case 1: Normal social login (not Google One Tap) - validate state parameter
    return validateState(state, connectorId);
  }

  if (isExternalCredential) {
    // Case 2: Google One Tap from external website (no CSRF token) - always valid
    return true;
  }

  // Case 3: Google One Tap from Experience app
  // Check if CSRF token is present and validate it
  // This handles the case where Google One Tap doesn't properly set CSRF token
  const csrfToken = params[GoogleConnector.oneTapParams.csrfToken];
  return validateGoogleOneTapCsrfToken(csrfToken);
};

/**
 * Validate the session based on different scenarios:
 * 1. Normal social login: requires valid verificationId
 * 2. Google One Tap from Experience app: allow if CSRF token valid
 * 3. Google One Tap from external website: always valid (Google verified)
 *
 * @param verificationId - The verification record id
 * @param isGoogleOneTap - Whether the login is Google One Tap
 * @param isExternalCredential - Whether the login is from external website Google One Tap
 * @param params - The parameters to validate
 * @returns Whether the session is valid
 */
export const getSessionValidationResult = ({
  verificationId,
  isGoogleOneTap,
  isExternalCredential,
  params,
}: {
  verificationId?: string;
  isGoogleOneTap: boolean;
  isExternalCredential: boolean;
  params: Record<string, string>;
}): boolean => {
  // If we have a verificationId, it's always valid (normal flow)
  if (verificationId) {
    return true;
  }

  if (!isGoogleOneTap) {
    // Normal social login without verificationId is invalid
    return false;
  }

  if (isExternalCredential) {
    // External Google One Tap always valid
    return true;
  }

  // Experience Google One Tap: allow if CSRF token valid or missing
  const csrfToken = params[GoogleConnector.oneTapParams.csrfToken];
  return validateGoogleOneTapCsrfToken(csrfToken);
};

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
  setStorageItem(`${storageCallbackLinkKeyPrefix}:${connectorId}`, callbackLink);
};

export const getCallbackLinkFromStorage = (connectorId: string) => {
  return getStorageItem(`${storageCallbackLinkKeyPrefix}:${connectorId}`);
};

export const removeCallbackLinkFromStorage = (connectorId: string) => {
  removeStorageItem(`${storageCallbackLinkKeyPrefix}:${connectorId}`);
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
