import { mobileUriSchemeProtocolRegEx, webRedirectUriProtocolRegEx } from '../regex.js';

export const validateRedirectUrl = (url: string, type: 'web' | 'mobile') => {
  try {
    const { protocol } = new URL(url);
    const protocolRegEx =
      type === 'mobile' ? mobileUriSchemeProtocolRegEx : webRedirectUriProtocolRegEx;

    return protocolRegEx.test(protocol);
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
