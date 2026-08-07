/**
 * @overview CIMD redirect URI matching branches, dispatched to by `../redirect-uri/index.js`
 * when the resolved client is in the CIMD namespace.
 *
 * CIMD clients (draft-02) take a stricter exact branch than registered applications on both
 * matching methods — their redirect and post-logout URIs come from the same metadata document,
 * so a non-wildcard registered value must equal the raw request string (RFC 9700 simple string
 * comparison, no URL normalization). The RFC 8252 loopback port exception applies to the
 * authorization redirect only: RFC 9700 builds it into that matching rule, while RP-Initiated
 * Logout requires exact matching with no exception.
 */

import { loopbackHostnames, wildcardUrlMatch } from '../redirect-uri/utils.js';

/**
 * The CIMD exact branch compares the raw request string — draft-02 mandates RFC 9700 simple
 * string comparison, so parsed-URL equality would widen matching through normalization (default
 * ports, hostname case, trailing slashes, percent-encoding). Parsing stays for validity checks
 * and wildcard expansion only.
 */
export const matchAgainstRegisteredCimd = (
  registeredUris: readonly string[],
  value: string,
  parsed: URL
) =>
  registeredUris.some((allowed) =>
    allowed.includes('*') ? wildcardUrlMatch(allowed, parsed) : allowed === value
  );

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
 * raw strings and compare every remaining character position. The registered-application
 * retry's parsed comparison would reintroduce normalization beyond the exception (hostname
 * case folding, path normalization). The parsed candidate still gates eligibility only.
 */
export const matchLoopbackPortInsensitiveCimd = (
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
