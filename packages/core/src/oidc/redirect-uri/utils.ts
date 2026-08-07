/**
 * @overview Shared primitives for redirect URI matching: URL parsing, loopback knowledge, and
 * the Logto wildcard pattern subsystem. Kept free of matching policy so both the registered
 * application matchers (`./index.js`) and the CIMD matchers (`../cimd/redirect-uri.js`) can
 * build on them without an import cycle.
 */

import { trySafe } from '@silverhand/essentials';

/** @see {@link https://github.com/logto-io/node-oidc-provider/blob/v9/lib/consts/client_attributes.js | Upstream `LOOPBACKS`} */
export const loopbackHostnames = new Set(['localhost', '127.0.0.1', '[::1]']);

export const parseUrl = (value: string) => trySafe(() => new URL(value));

const escapeRegExp = (value: string) => value.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);

const getEffectivePort = (protocol: string, port: string) => {
  if (port) {
    return port;
  }

  switch (protocol) {
    case 'http:': {
      return '80';
    }
    case 'https:': {
      return '443';
    }
    default: {
      return '';
    }
  }
};

const matchHostnameWithWildcards = (patternHostname: string, actualHostname: string) => {
  const pattern = patternHostname.toLowerCase();
  const actual = actualHostname.toLowerCase();

  if (!pattern.includes('*')) {
    return pattern === actual;
  }

  const patternLabels = pattern.split('.');
  const actualLabels = actual.split('.');

  if (patternLabels.length !== actualLabels.length) {
    return false;
  }

  return patternLabels.every((labelPattern, index) => {
    const label = actualLabels[index] ?? '';

    if (!labelPattern.includes('*')) {
      return labelPattern === label;
    }

    const regex = new RegExp(
      `^${labelPattern
        .split('*')
        .map((part) => escapeRegExp(part))
        .join('[^.]+')}$`,
      'i'
    );
    return regex.test(label);
  });
};

const matchPathWithWildcards = (patternPathname: string, actualPathname: string) => {
  if (!patternPathname.includes('*')) {
    return patternPathname === actualPathname;
  }

  const regex = new RegExp(
    `^${patternPathname
      .split('*')
      .map((part) => escapeRegExp(part))
      .join('.*')}$`
  );
  return regex.test(actualPathname);
};

type WildcardUrlPattern = {
  protocol: string;
  port: string;
  hostnamePattern: string;
  pathnamePattern: string;
  search: string;
  hash: string;
};

// eslint-disable-next-line complexity -- ported from the fork verbatim; the checks are flat guards
const parseWildcardUrlPattern = (pattern: string): WildcardUrlPattern | undefined => {
  const schemeSeparatorIndex = pattern.indexOf('://');
  if (schemeSeparatorIndex <= 0) {
    return;
  }

  // Disallow wildcards in scheme.
  if (pattern.slice(0, schemeSeparatorIndex).includes('*')) {
    return;
  }

  // Disallow wildcards in query/hash (matching stays deterministic and safer).
  const queryIndex = pattern.indexOf('?');
  if (queryIndex >= 0 && pattern.slice(queryIndex).includes('*')) {
    return;
  }

  const hashIndex = pattern.indexOf('#');
  if (hashIndex >= 0 && pattern.slice(hashIndex).includes('*')) {
    return;
  }

  const parsed = parseUrl(pattern.replaceAll('*', 'wildcard'));
  if (!parsed) {
    return;
  }

  const rest = pattern.slice(schemeSeparatorIndex + 3);
  const authority = rest.split(/[#/?]/)[0] ?? '';
  if (!authority || authority.includes('@') || authority.startsWith('[')) {
    return;
  }

  const lastColonIndex = authority.lastIndexOf(':');
  const hasPort = lastColonIndex > -1 && authority.indexOf(':') === lastColonIndex;
  if (hasPort && authority.slice(lastColonIndex + 1).includes('*')) {
    return;
  }

  const hostnamePattern = hasPort ? authority.slice(0, lastColonIndex) : authority;

  // When a wildcard is used in the hostname, require at least one dot to avoid overly broad
  // patterns.
  if (hostnamePattern.includes('*') && !hostnamePattern.includes('.')) {
    return;
  }

  // Disallow wildcards in the TLD position — the last two labels must not contain wildcards.
  // This prevents overly broad patterns like `*.com` or `example.*`.
  const hostnameLabels = hostnamePattern.split('.');
  if (hostnameLabels.slice(-2).some((label) => label.includes('*'))) {
    return;
  }

  const pathStartIndex = schemeSeparatorIndex + 3 + authority.length;
  const pathEndIndex = Math.min(
    pattern.length,
    queryIndex >= 0 ? queryIndex : pattern.length,
    hashIndex >= 0 ? hashIndex : pattern.length
  );

  const pathnamePattern = pattern.slice(pathStartIndex, pathEndIndex) || '/';

  return {
    protocol: parsed.protocol,
    port: parsed.port,
    hostnamePattern,
    pathnamePattern,
    search: parsed.search,
    hash: parsed.hash,
  };
};

export const wildcardUrlMatch = (pattern: string, actual: URL): boolean => {
  const parsedPattern = parseWildcardUrlPattern(pattern);
  if (!parsedPattern) {
    return false;
  }

  if (actual.protocol !== parsedPattern.protocol) {
    return false;
  }

  if (
    getEffectivePort(actual.protocol, actual.port) !==
    getEffectivePort(parsedPattern.protocol, parsedPattern.port)
  ) {
    return false;
  }

  if (!matchHostnameWithWildcards(parsedPattern.hostnamePattern, actual.hostname)) {
    return false;
  }

  if (!matchPathWithWildcards(parsedPattern.pathnamePattern, actual.pathname)) {
    return false;
  }

  return actual.search === parsedPattern.search && actual.hash === parsedPattern.hash;
};

/**
 * Whether a redirect URI value is a wildcard pattern (contains `*`) the runtime matcher
 * supports. Used by the CIMD `allowClient` policy so remote metadata documents cannot register
 * patterns the matcher would never match (or overly broad ones such as `*.com`). A plain URI
 * without `*` is not a wildcard pattern, so it never qualifies.
 */
export const isValidWildcardRedirectUriPattern = (pattern: string): boolean =>
  pattern.includes('*') && parseWildcardUrlPattern(pattern) !== undefined;
