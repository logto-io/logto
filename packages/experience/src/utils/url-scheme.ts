import { trySafe } from '@silverhand/essentials';

/** Schemes that execute script or read local resources when navigated to. */
const dangerousSchemes = new Set([
  // eslint-disable-next-line no-script-url -- naming the scheme is what lets this set block it
  'javascript:',
  'vbscript:',
  'data:',
  'blob:',
  'filesystem:',
  'view-source:',
  'file:',
  'about:',
]);

const webSchemes = new Set(['http:', 'https:']);

// The URL parser lowercases the scheme and strips whitespace, tabs, and newlines.
const getProtocol = (value: string) => trySafe(() => new URL(value).protocol);

/**
 * Whether the value is a native app deep link, e.g. `logto://callback` or the host-less
 * `logto:logto.android.com` form.
 *
 * `http(s):` is rejected. This link is navigated to with the identity provider's query string
 * appended, so it has to address the app itself rather than any web origin. It is not the
 * application's OAuth redirect URI, which is supplied separately as `callbackUri` and is expected
 * to be `http(s):`.
 */
export const isValidNativeCallbackLink = (link: string): boolean => {
  const protocol = getProtocol(link);

  return Boolean(protocol && !dangerousSchemes.has(protocol) && !webSchemes.has(protocol));
};

/**
 * Whether the value is safe to navigate to as a web redirect target.
 *
 * Only `http:` and `https:` are accepted. This bounds the scheme, not the destination — the
 * target is an identity provider's authorization URL and is legitimately cross-origin.
 */
export const isValidWebRedirectUri = (uri: string): boolean => {
  const protocol = getProtocol(uri);

  return Boolean(protocol && webSchemes.has(protocol));
};
