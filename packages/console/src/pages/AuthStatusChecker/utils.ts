import psl from 'psl';

import { DOMAIN_WHITELIST, STORAGE_ACCESS_TEST_KEY } from './consts';
import type { CheckAdminTokenMessage } from './types';
import { AuthMessageType } from './types';

/**
 * Extract the effective top-level domain from a hostname using psl library
 * This replaces the previous manual implementation with a more accurate one
 */
const getEffectiveTLD = (hostname: string): string => {
  const parsed = psl.parse(hostname.toLowerCase());

  // Check if parsing was successful and return the domain, otherwise return original hostname
  if ('domain' in parsed && parsed.domain) {
    return parsed.domain;
  }

  return hostname;
};

/**
 * Check if a hostname matches a wildcard pattern
 * Supports patterns like "*.example.com"
 */
const matchesWildcard = (hostname: string, pattern: string): boolean => {
  if (!pattern.includes('*')) {
    return hostname === pattern;
  }

  // Convert wildcard pattern to regex
  const regexPattern = pattern
    .replaceAll('.', '\\.') // Escape dots
    .replaceAll('*', '[^.]*'); // Replace * with [^.]* (any character except dot)

  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(hostname);
};

/**
 * Check if an origin is valid for cross-origin communication
 * @param eventOrigin - The origin of the incoming message
 * @param currentOrigin - The current page's origin
 * @returns boolean indicating if the origin is valid
 */
export const isValidOrigin = (eventOrigin: string, currentOrigin: string): boolean => {
  try {
    const currentUrl = new URL(currentOrigin);
    const eventUrl = new URL(eventOrigin);

    const currentHostname = currentUrl.hostname;
    const eventHostname = eventUrl.hostname;

    // 1. Same origin (exact match)
    if (eventOrigin === currentOrigin) {
      return true;
    }

    // 2. Both are localhost (for development)
    if (currentHostname === 'localhost' && eventHostname === 'localhost') {
      return true;
    }

    // 3. Same effective top-level domain (using psl library)
    if (currentHostname.includes('.') && eventHostname.includes('.')) {
      const currentTLD = getEffectiveTLD(currentHostname);
      const eventTLD = getEffectiveTLD(eventHostname);

      if (currentTLD === eventTLD) {
        return true;
      }
    }

    // 4. Check whitelist patterns
    for (const pattern of DOMAIN_WHITELIST) {
      if (matchesWildcard(eventHostname, pattern)) {
        return true;
      }
    }

    return false;
  } catch {
    // Invalid URL format
    return false;
  }
};

// Type guard function to safely check if data is CheckAdminTokenMessage
export const isCheckAdminTokenMessage = (data: unknown): data is CheckAdminTokenMessage => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  return (
    Object.hasOwn(data, 'type') && Reflect.get(data, 'type') === AuthMessageType.CHECK_ADMIN_TOKEN
  );
};

/**
 * Check if localStorage is accessible in the current context
 */
export const checkStorageAccess = (): { accessible: boolean; error?: string } => {
  try {
    // Test if we can access localStorage
    const testKey = STORAGE_ACCESS_TEST_KEY;
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (testValue !== 'test') {
      return { accessible: false, error: 'localStorage read/write test failed' };
    }

    return { accessible: true };
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown localStorage error',
    };
  }
};

/**
 * Request storage access using the Storage Access API
 */
export const requestStorageAccess = async (): Promise<{
  granted: boolean;
  hasAccess: boolean;
  error?: string;
}> => {
  try {
    // Check if Storage Access API is available
    if (!('requestStorageAccess' in document) || !('hasStorageAccess' in document)) {
      return { granted: false, hasAccess: false, error: 'Storage Access API not available' };
    }

    // Check if we already have storage access
    const hasAccess = await document.hasStorageAccess();
    if (hasAccess) {
      return { granted: true, hasAccess: true };
    }

    // Request storage access
    await document.requestStorageAccess();
    const newHasAccess = await document.hasStorageAccess();

    return { granted: newHasAccess, hasAccess: newHasAccess };
  } catch (error) {
    return {
      granted: false,
      hasAccess: false,
      error: error instanceof Error ? error.message : 'Storage access request failed',
    };
  }
};
