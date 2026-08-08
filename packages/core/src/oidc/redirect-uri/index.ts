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
 * CIMD clients (draft-02) take a stricter exact branch on both methods — the semantics live in
 * `../cimd/redirect-uri.js`, and which clients reach the loopback retry is this module's policy
 * (see the comment in `redirectUriAllowed`). Wildcard patterns remain a non-standard Logto
 * extension for CIMD clients too; a document relying on them cannot claim strict draft-02
 * conformance.
 */

import { isCimdClientId } from '@logto/shared';
import { type Provider } from 'oidc-provider';

import {
  matchAgainstRegisteredCimd,
  matchLoopbackPortInsensitiveCimd,
} from '../cimd/redirect-uri.js';

import { loopbackHostnames, parseUrl, wildcardUrlMatch } from './utils.js';

const matchAgainstRegistered = (registeredUris: readonly string[], parsed: URL) =>
  registeredUris.some((allowed) =>
    allowed.includes('*')
      ? wildcardUrlMatch(allowed, parsed)
      : parseUrl(allowed)?.href === parsed.href
  );

/**
 * The RFC 8252 §7.3 retry for registered applications: parse both sides, clear the ports, and
 * compare the serialized URLs — normalization beyond the port matches the shipped native-app
 * behavior. Only `http:` loopback candidates qualify; which clients reach the retry is the
 * callers' policy.
 */
const matchLoopbackPortInsensitive = (registeredUris: readonly string[], parsed: URL) => {
  if (parsed.protocol !== 'http:' || !loopbackHostnames.has(parsed.hostname)) {
    return false;
  }

  const candidate = new URL(parsed.href);
  // eslint-disable-next-line @silverhand/fp/no-mutation -- URL port stripping mutates a local copy
  candidate.port = '';

  return registeredUris.some((allowed) => {
    const registered = parseUrl(allowed);
    if (!registered) {
      return false;
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation -- URL port stripping mutates a local copy
    registered.port = '';
    return candidate.href === registered.href;
  });
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
