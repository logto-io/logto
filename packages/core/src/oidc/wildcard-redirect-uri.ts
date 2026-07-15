/**
 * @overview Wildcard redirect URI matching for OIDC clients.
 *
 * The v8 fork of oidc-provider carried this logic inside `Client.prototype.redirectUriAllowed` /
 * `postLogoutRedirectUriAllowed` (fork patch logto-io/node-oidc-provider#18). The v9 fork
 * deliberately drops that patch (see the fork's PATCHES.md), so the matching moves here and is
 * installed onto the per-tenant `provider.Client` prototype right after the provider is created.
 *
 * Matching semantics are unchanged from the fork:
 *
 * - `*` is supported in the hostname and pathname only — never in scheme, port, query, or hash.
 * - A hostname wildcard requires at least one dot, and the last two labels must be literal, so
 *   overly broad patterns such as `*.com` or `example.*` never match anything.
 * - A candidate value containing `*` is always rejected, so a wildcard pattern itself can never
 *   serve as a concrete redirect target. This also covers the fork's `one_redirect_uri_clients`
 *   guard: when the provider defaults a sole registered wildcard URI as the `redirect_uri`
 *   parameter, the match fails and the authorization request is rejected.
 */

import { trySafe } from '@silverhand/essentials';
import { type Provider } from 'oidc-provider';

/** @see {@link https://github.com/logto-io/node-oidc-provider/blob/v9/lib/consts/client_attributes.js | Upstream `LOOPBACKS`} */
const loopbackHostnames = new Set(['localhost', '127.0.0.1', '[::1]']);

const parseUrl = (value: string) => trySafe(() => new URL(value));

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

const matchAgainstRegistered = (registeredUris: readonly string[], parsed: URL) =>
  registeredUris.some((allowed) =>
    allowed.includes('*')
      ? wildcardUrlMatch(allowed, parsed)
      : parseUrl(allowed)?.href === parsed.href
  );

/**
 * Override `redirectUriAllowed` and `postLogoutRedirectUriAllowed` on the provider's per-tenant
 * `Client` class with wildcard-aware implementations. Call right after `new Provider(...)`.
 *
 * The bodies mirror the v8 fork's patched implementations — the RFC 8252 port-insensitive
 * loopback matching for native clients applies to `redirectUriAllowed` only, matching the
 * behavior Logto has shipped — with two additions: registered URIs containing `*` match through
 * {@link wildcardUrlMatch}, and candidate values containing `*` are always rejected.
 */
export const installWildcardRedirectUriMatching = (provider: Provider) => {
  const { Client } = provider;

  /* eslint-disable @silverhand/fp/no-mutation -- overriding prototype methods requires mutation */
  Client.prototype.redirectUriAllowed = function (value: string) {
    if (value.includes('*')) {
      return false;
    }

    const parsed = parseUrl(value);
    if (!parsed) {
      return false;
    }

    const matched = matchAgainstRegistered(this.redirectUris ?? [], parsed);

    if (
      matched ||
      this.applicationType !== 'native' ||
      parsed.protocol !== 'http:' ||
      !loopbackHostnames.has(parsed.hostname)
    ) {
      return matched;
    }

    parsed.port = '';

    return (this.redirectUris ?? []).some((allowed) => {
      const registered = parseUrl(allowed);
      if (!registered) {
        return false;
      }
      registered.port = '';
      return parsed.href === registered.href;
    });
  };

  Client.prototype.postLogoutRedirectUriAllowed = function (value: string) {
    if (value.includes('*')) {
      return false;
    }

    const parsed = parseUrl(value);
    if (!parsed) {
      return false;
    }

    return matchAgainstRegistered(this.postLogoutRedirectUris ?? [], parsed);
  };
  /* eslint-enable @silverhand/fp/no-mutation */
};
