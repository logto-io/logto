import { DOMAIN_WHITELIST, STORAGE_ACCESS_TEST_KEY } from './consts';
import type { CheckAdminTokenMessage } from './types';
import { AuthMessageType } from './types';

// Common two-level TLDs (country code + generic)
// We can add more TLDs here if needed.
const COMMON_TWO_LEVEL_TLDS = new Set([
  'co.uk',
  'co.jp',
  'co.kr',
  'co.za',
  'co.in',
  'co.nz',
  'co.il',
  'co.th',
  'com.au',
  'com.br',
  'com.cn',
  'com.mx',
  'com.sg',
  'com.tw',
  'com.tr',
  'net.au',
  'net.br',
  'net.cn',
  'net.uk',
  'org.au',
  'org.br',
  'org.cn',
  'org.uk',
  'edu.au',
  'edu.br',
  'edu.cn',
  'edu.uk',
  'gov.au',
  'gov.br',
  'gov.cn',
  'gov.uk',
  'ac.uk',
  'ac.jp',
  'ac.kr',
  'ac.za',
  'ac.in',
  'ac.nz',
  'ac.il',
  'ac.th',
]);

/**
 * Check if a string is a known two-level TLD
 */
const isKnownTwoLevelTLD = (tld: string): boolean => {
  return COMMON_TWO_LEVEL_TLDS.has(tld);
};

/**
 * Extract the effective top-level domain from a hostname
 * Handles both simple TLDs (.com, .org) and compound TLDs (.co.uk, .com.au)
 */
const getEffectiveTLD = (hostname: string): string => {
  const parts = hostname.toLowerCase().split('.');

  if (parts.length < 2) {
    return hostname;
  }

  // Check for compound TLDs
  if (parts.length >= 3) {
    const lastTwoParts = parts.slice(-2).join('.');
    if (isKnownTwoLevelTLD(lastTwoParts)) {
      // For compound TLDs, return domain + compound TLD (e.g., "example.co.uk")
      return parts.slice(-3).join('.');
    }
  }

  // For simple TLDs, return domain + TLD (e.g., "example.com")
  return parts.slice(-2).join('.');
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

    // 3. Same effective top-level domain
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
