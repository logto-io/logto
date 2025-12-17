import { mobileUriSchemeProtocolRegEx, webRedirectUriProtocolRegEx } from '../regex.js';

export const validateRedirectUrl = (url: string, type: 'web' | 'mobile') => {
  if (type === 'web' && url.includes('*')) {
    return validateWildcardWebRedirectUrl(url);
  }

  if (type === 'web' && hasDotSegmentsInAbsoluteUrlPath(url)) {
    return false;
  }

  try {
    const { protocol } = new URL(url);
    const protocolRegEx =
      type === 'mobile' ? mobileUriSchemeProtocolRegEx : webRedirectUriProtocolRegEx;

    return protocolRegEx.test(protocol);
  } catch {
    return false;
  }
};

const validateWildcardWebRedirectUrl = (url: string) => {
  const schemeSeparatorIndex = url.indexOf('://');
  if (schemeSeparatorIndex <= 0) {
    return false;
  }

  if (hasWildcardInScheme(url, schemeSeparatorIndex)) {
    return false;
  }

  if (hasWildcardInQueryOrHash(url)) {
    return false;
  }

  const authority = getAuthorityFromUrl(url, schemeSeparatorIndex);
  if (!isAuthorityAllowedForWildcardWebRedirect(authority)) {
    return false;
  }

  if (hasDotSegmentsInAbsoluteUrlPath(url)) {
    return false;
  }

  return isUrlProtocolAllowedAfterWildcardReplacement(url);
};

const hasWildcardInScheme = (url: string, schemeSeparatorIndex: number) =>
  url.slice(0, schemeSeparatorIndex).includes('*');

const hasWildcardInQueryOrHash = (url: string) => {
  // Disallow wildcards in query/hash to keep matching deterministic and safer.
  const queryIndex = url.indexOf('?');
  if (queryIndex >= 0 && url.slice(queryIndex).includes('*')) {
    return true;
  }

  const hashIndex = url.indexOf('#');
  return hashIndex >= 0 && url.slice(hashIndex).includes('*');
};

const getAuthorityFromUrl = (url: string, schemeSeparatorIndex: number) =>
  url.slice(schemeSeparatorIndex + 3).split(/[#/?]/)[0] ?? '';

const hasDotSegmentsInAbsoluteUrlPath = (url: string) => {
  const schemeSeparatorIndex = url.indexOf('://');
  if (schemeSeparatorIndex <= 0) {
    return false;
  }

  const authority = getAuthorityFromUrl(url, schemeSeparatorIndex);
  const afterAuthorityIndex = schemeSeparatorIndex + 3 + authority.length;
  const rest = url.slice(afterAuthorityIndex);
  const path = rest.split(/[?#]/)[0] ?? '';

  if (!path) {
    return false;
  }

  const segments = path.split('/');
  return segments.some((segment) => {
    const normalized = segment.toLowerCase();

    return (
      segment === '.' ||
      segment === '..' ||
      normalized === '%2e' ||
      normalized === '%2e%2e'
    );
  });
};

const isAuthorityAllowedForWildcardWebRedirect = (authority: string) => {
  // Disallow credentials in authority part.
  if (authority.includes('@')) {
    return false;
  }

  if (authority.startsWith('[')) {
    // IPv6 literals are not a typical use-case for wildcard redirect URIs; reject for simplicity.
    return false;
  }

  const lastColonIndex = authority.lastIndexOf(':');
  const hasPort = lastColonIndex > -1 && authority.indexOf(':') === lastColonIndex;
  const hostname = hasPort ? authority.slice(0, lastColonIndex) : authority;

  // When wildcard is used in hostname, require at least one dot to avoid overly broad patterns.
  if (hostname.includes('*') && !hostname.includes('.')) {
    return false;
  }

  return !(hasPort && authority.slice(lastColonIndex + 1).includes('*'));
};

const isUrlProtocolAllowedAfterWildcardReplacement = (url: string) => {
  try {
    const parsed = new URL(url.replaceAll('*', 'wildcard'));
    return webRedirectUriProtocolRegEx.test(parsed.protocol);
  } catch {
    return false;
  }
};

export const validateUriOrigin = (url: string) => {
  try {
    return new URL(url).origin === url;
  } catch {
    return false;
  }
};

export const isValidUrl = (url?: string) => {
  try {
    return Boolean(url && new URL(url));
  } catch {
    return false;
  }
};

/**
 * Check if the given URL is localhost
 */
export const isLocalhost = (url: string) => {
  const parsedUrl = new URL(url);

  return ['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname);
};

/**
 * Check if the request URL is a file asset path.
 * The check is based on the last segment of the URL path containing a dot, ignoring query params.
 * Example:
 * - `path/scripts.js` -> true
 * - `path/index.html?query=param` -> true
 * - `path` -> false
 * - `path?email=abc@test.com` -> false
 * @param url Request URL
 * @returns Boolean value indicating if the request URL is a file asset path
 */
export const isFileAssetPath = (url: string): boolean => {
  const pathWithoutQuery = url.split('?')[0];
  return Boolean(pathWithoutQuery?.split('/').at(-1)?.includes('.'));
};

/**
 * Parse the "range" request header value to get the start, end, and count values.
 * Example:
 * - `range: bytes=0-499` -> { start: 0, end: 499, count: 500 }
 * - `range: bytes=0-` -> { start: 0, end: undefined, count: undefined }
 * - `range: invalid` -> Error: Range not satisfiable
 * - Without range header -> { start: undefined, end: undefined, count: undefined }
 * @param range Range request header value
 * @returns Object containing start, end, and count values
 */
export const parseRange = (range: string) => {
  const rangeMatch = /bytes=(\d+)-(\d+)?/.exec(range);
  if (range && !rangeMatch) {
    throw new Error('Range not satisfiable.');
  }

  const start = rangeMatch?.[1] === undefined ? undefined : Number.parseInt(rangeMatch[1], 10);
  const end = rangeMatch?.[2] === undefined ? undefined : Number.parseInt(rangeMatch[2], 10);
  const count = end === undefined ? undefined : end - (start ?? 0) + 1;

  return {
    start,
    end,
    count,
  };
};
