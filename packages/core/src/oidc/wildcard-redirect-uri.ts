/**
 * @overview Wildcard redirect URI matching for OIDC clients.
 *
 * The v8 fork of oidc-provider carried this logic inside `Client.prototype.redirectUriAllowed` /
 * `postLogoutRedirectUriAllowed` (fork patch logto-io/node-oidc-provider#18). The v9 fork
 * deliberately drops that patch (see the fork's PATCHES.md), so the matching moves here and is
 * installed onto the per-tenant `provider.Client` prototype right after the provider is created.
 *
 * Matching semantics for registered applications are unchanged from the fork:
 *
 * - `*` is supported in the hostname and pathname only — never in scheme, port, query, or hash.
 * - A hostname wildcard requires at least one dot, and the last two labels must be literal, so
 *   overly broad patterns such as `*.com` or `example.*` never match anything.
 * - A candidate value containing `*` is always rejected, so a wildcard pattern itself can never
 *   serve as a concrete redirect target. This also covers the fork's `one_redirect_uri_clients`
 *   guard: when the provider defaults a sole registered wildcard URI as the `redirect_uri`
 *   parameter, the match fails and the authorization request is rejected.
 *
 * CIMD clients (draft-02) take a stricter exact branch on both methods — their redirect and
 * post-logout URIs come from the same metadata document, so a non-wildcard registered value
 * must equal the raw request string (RFC 9700 simple string comparison, no URL normalization).
 * The RFC 8252 loopback port exception applies to the authorization redirect only — RFC 9700
 * builds it into that matching rule, while RP-Initiated Logout requires exact matching with no
 * exception — and it anchors on the URI shape rather than the declared application type: the
 * type is self-declared and commonly omitted (schema-defaulted to `web`), and it cannot be
 * inferred from registered URIs either — native apps span custom schemes, loopback, and https
 * App Links, the last indistinguishable from web callbacks. Only an `http:` loopback
 * registration — a URI with no non-local use whatever the document declares — matches through
 * the retry. Wildcard
 * patterns remain a non-standard Logto extension for CIMD clients too; a document relying on
 * them cannot claim strict draft-02 conformance.
 */

import { trySafe } from '@silverhand/essentials';
import { type Provider } from 'oidc-provider';

import { isCimdClientId } from './cimd-client-id.js';

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

/**
 * Whether a redirect URI value containing `*` is a valid Logto wildcard pattern. Used by the
 * CIMD `allowClient` policy so remote metadata documents cannot register patterns the runtime
 * matcher would never match (or overly broad ones such as `*.com`).
 */
export const isValidWildcardRedirectUriPattern = (pattern: string): boolean =>
  parseWildcardUrlPattern(pattern) !== undefined;

const matchAgainstRegistered = (registeredUris: readonly string[], parsed: URL) =>
  registeredUris.some((allowed) =>
    allowed.includes('*')
      ? wildcardUrlMatch(allowed, parsed)
      : parseUrl(allowed)?.href === parsed.href
  );

/**
 * The CIMD exact branch compares the raw request string — draft-02 mandates RFC 9700 simple
 * string comparison, so parsed-URL equality would widen matching through normalization (default
 * ports, hostname case, trailing slashes, percent-encoding). Parsing stays for validity checks
 * and wildcard expansion only.
 */
const matchAgainstRegisteredCimd = (
  registeredUris: readonly string[],
  value: string,
  parsed: URL
) =>
  registeredUris.some((allowed) =>
    allowed.includes('*') ? wildcardUrlMatch(allowed, parsed) : allowed === value
  );

/**
 * The RFC 8252 §7.3 retry for registered applications: parse both sides, clear the ports, and
 * compare the serialized URLs — normalization beyond the port matches the shipped native-app
 * behavior. Only `http:` loopback candidates qualify; which clients reach the retry is the
 * callers' policy.
 */
/* eslint-disable @silverhand/fp/no-mutation -- URL port stripping mutates local copies */
const matchLoopbackPortInsensitive = (registeredUris: readonly string[], parsed: URL) => {
  if (parsed.protocol !== 'http:' || !loopbackHostnames.has(parsed.hostname)) {
    return false;
  }

  const candidate = new URL(parsed.href);
  candidate.port = '';

  return registeredUris.some((allowed) => {
    const registered = parseUrl(allowed);
    if (!registered) {
      return false;
    }
    registered.port = '';
    return candidate.href === registered.href;
  });
};
/* eslint-enable @silverhand/fp/no-mutation */

/**
 * Strip a `:port` in the authority position from the raw string. The character classes mirror
 * the WHATWG authority delimiters for special schemes (`/`, `\`, `?`, `#`), so after a raw `\`
 * — which ends the authority — a `:digits` sequence is path content to the parser and never
 * matches; the string then stays untouched and the comparison fails closed. Deliberately no
 * `parsed.port` precondition: WHATWG reports an explicit default port (`http://…:80`) as an
 * empty `port`, which would exempt `:80` registrations from stripping and break their
 * variable-port matching.
 */
const stripLoopbackPort = (value: string) =>
  value.replace(/^(https?:\/\/(?:\[[^\\\]]+\]|[^\\/:?#]+)):\d+(?=[/?#]|$)/iu, '$1');

/**
 * The CIMD retry keeps RFC 9700's exception scoped to the port alone: strip a `:port` from the
 * raw strings and compare every remaining character position. The parsed comparison above would
 * reintroduce normalization beyond the exception (hostname case folding, path normalization).
 * The parsed candidate still gates eligibility only.
 */
const matchLoopbackPortInsensitiveCimd = (
  registeredUris: readonly string[],
  value: string,
  parsed: URL
) => {
  if (parsed.protocol !== 'http:' || !loopbackHostnames.has(parsed.hostname)) {
    return false;
  }

  const candidate = stripLoopbackPort(value);
  return registeredUris.some((allowed) => stripLoopbackPort(allowed) === candidate);
};

/**
 * Override `redirectUriAllowed` and `postLogoutRedirectUriAllowed` on the provider's per-tenant
 * `Client` class with wildcard-aware implementations. Call right after `new Provider(...)`.
 *
 * The bodies mirror the v8 fork's patched implementations — for registered applications the
 * RFC 8252 port-insensitive loopback matching applies to `redirectUriAllowed` only, matching
 * the behavior Logto has shipped — with two additions: registered URIs containing `*` match
 * through {@link wildcardUrlMatch}, and candidate values containing `*` are always rejected.
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

    const cimd = isCimdClientId(this.clientId);
    const registeredUris = this.redirectUris ?? [];

    const matched = cimd
      ? matchAgainstRegisteredCimd(registeredUris, value, parsed)
      : matchAgainstRegistered(registeredUris, parsed);

    /**
     * Registered applications reach the loopback retry only when declared native — the shipped
     * behavior, where the tenant picks the type in the Console. CIMD clients reach it on URI
     * shape alone: their application type is self-declared and commonly omitted
     * (schema-defaulted to `web`), and it cannot be inferred from registered URIs either —
     * native apps span custom schemes, loopback, and https App Links, the last
     * indistinguishable from web callbacks. An `http:` loopback registration has no non-local
     * use whatever the label says, so only such registrations match through the retry. This
     * deliberately extends RFC 9700's literal native-app scoping for CIMD interoperability;
     * the exposure is low and mitigated by the PKCE requirement on public clients.
     */
    if (matched || (!cimd && this.applicationType !== 'native')) {
      return matched;
    }

    return cimd
      ? matchLoopbackPortInsensitiveCimd(registeredUris, value, parsed)
      : matchLoopbackPortInsensitive(registeredUris, parsed);
  };

  /**
   * RP-Initiated Logout requires the supplied value to exactly match a registered value, with
   * no loopback exception — so no client kind gets a port-insensitive retry here, and the CIMD
   * raw-string branch satisfies the rule more strictly than the registered-application
   * normalization does. The RFC 8252 exception stays scoped to the authorization redirect,
   * where RFC 9700 builds it into the matching rule.
   */
  Client.prototype.postLogoutRedirectUriAllowed = function (value: string) {
    if (value.includes('*')) {
      return false;
    }

    const parsed = parseUrl(value);
    if (!parsed) {
      return false;
    }

    const registeredUris = this.postLogoutRedirectUris ?? [];

    return isCimdClientId(this.clientId)
      ? matchAgainstRegisteredCimd(registeredUris, value, parsed)
      : matchAgainstRegistered(registeredUris, parsed);
  };
  /* eslint-enable @silverhand/fp/no-mutation */
};
