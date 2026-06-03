import type { GetAccountUserSessionsResponse } from '@logto/schemas';

type AccountSession = GetAccountUserSessionsResponse['sessions'][number];

/**
 * Parse a user-agent string into a human-readable device label (browser + OS).
 * Intentionally lightweight — no external dependency.
 */
export const parseUserAgent = (ua?: string): string => {
  if (!ua) {
    return 'Unknown device';
  }

  const browser = detectBrowser(ua);
  const os = detectOS(ua);

  return [browser, os].filter(Boolean).join(' on ') || 'Unknown device';
};

const detectBrowser = (ua: string): string => {
  const lower = ua.toLowerCase();
  // Order matters: check more specific patterns first
  if (lower.includes('edg/')) {
    return 'Edge';
  }
  if (lower.includes('opr/') || lower.includes('opera')) {
    return 'Opera';
  }
  if (lower.includes('chrome/') && !lower.includes('chromium')) {
    return 'Chrome';
  }
  if (lower.includes('firefox/')) {
    return 'Firefox';
  }
  if (lower.includes('safari/') && !lower.includes('chrome')) {
    return 'Safari';
  }
  return '';
};

const detectOS = (ua: string): string => {
  const lower = ua.toLowerCase();
  if (lower.includes('windows')) {
    return 'Windows';
  }
  if (lower.includes('macintosh') || lower.includes('mac os x')) {
    return 'macOS';
  }
  if (lower.includes('android')) {
    return 'Android';
  }
  if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ipod')) {
    return 'iOS';
  }
  if (lower.includes('linux')) {
    return 'Linux';
  }
  return '';
};

/**
 * Build a location string from country/city fields.
 */
export const formatLocation = (country?: string, city?: string): string | undefined => {
  const parts = [city, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
};

/**
 * Build session meta text (IP + location).
 */
export const formatSessionMeta = (session: AccountSession): string => {
  const signInContext = session.lastSubmission?.signInContext;
  const ip = signInContext?.ip;
  const location = formatLocation(signInContext?.country, signInContext?.city);

  const parts = [ip, location].filter(Boolean);
  return parts.join(' · ');
};
