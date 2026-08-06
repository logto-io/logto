import type { Provider } from 'oidc-provider';

import { createMockProvider } from '#src/test-utils/oidc-provider.js';

import {
  getRedirectUriMatchType,
  installWildcardRedirectUriMatching,
  isValidWildcardRedirectUriPattern,
  wildcardUrlMatch,
} from './wildcard-redirect-uri.js';

type ClientInstance = InstanceType<Provider['Client']>;

type ClientMetadataStub = {
  clientId?: string;
  redirectUris?: string[];
  postLogoutRedirectUris?: string[];
  applicationType?: 'web' | 'native';
};

const provider = createMockProvider();
installWildcardRedirectUriMatching(provider);

const { redirectUriAllowed, postLogoutRedirectUriAllowed } = provider.Client.prototype;

const asClient = ({ clientId = 'registered-app', ...metadata }: ClientMetadataStub) =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub scoped to the fields the overrides read
  ({ clientId, ...metadata }) as ClientInstance;

describe('wildcardUrlMatch', () => {
  it('matches a single-label hostname wildcard', () => {
    expect(
      wildcardUrlMatch(
        'https://*.example.com/callback',
        new URL('https://tenant.example.com/callback')
      )
    ).toBe(true);
    expect(
      wildcardUrlMatch(
        'https://*.example.com/callback',
        new URL('https://a.b.example.com/callback')
      )
    ).toBe(false);
  });

  it('rejects wildcards in the TLD position or hostnames without a dot', () => {
    expect(wildcardUrlMatch('https://*.com/callback', new URL('https://foo.com/callback'))).toBe(
      false
    );
    expect(
      wildcardUrlMatch('https://example.*/callback', new URL('https://example.com/callback'))
    ).toBe(false);
    expect(wildcardUrlMatch('https://*/callback', new URL('https://foo.com/callback'))).toBe(false);
  });

  it('rejects wildcards in scheme, port, query, and hash', () => {
    expect(
      wildcardUrlMatch('http*://app.example.com/cb', new URL('https://app.example.com/cb'))
    ).toBe(false);
    expect(
      wildcardUrlMatch('https://app.example.com:*/cb', new URL('https://app.example.com:8443/cb'))
    ).toBe(false);
    expect(
      wildcardUrlMatch(
        'https://app.example.com/cb?state=*',
        new URL('https://app.example.com/cb?state=x')
      )
    ).toBe(false);
    expect(
      wildcardUrlMatch('https://app.example.com/cb#*', new URL('https://app.example.com/cb#x'))
    ).toBe(false);
  });

  it('supports path wildcards and enforces ports', () => {
    expect(
      wildcardUrlMatch('https://app.example.com/cb/*', new URL('https://app.example.com/cb/foo'))
    ).toBe(true);
    expect(
      wildcardUrlMatch('https://app.example.com/cb/*', new URL('https://app.example.com/other'))
    ).toBe(false);
    expect(
      wildcardUrlMatch('https://*.example.com/cb', new URL('https://a.example.com:8443/cb'))
    ).toBe(false);
  });
});

describe('isValidWildcardRedirectUriPattern', () => {
  it('accepts patterns the runtime matcher supports', () => {
    expect(isValidWildcardRedirectUriPattern('https://*.example.com/callback')).toBe(true);
    expect(isValidWildcardRedirectUriPattern('https://app.example.com/cb/*')).toBe(true);
  });

  it('rejects patterns the runtime matcher would never match', () => {
    expect(isValidWildcardRedirectUriPattern('https://*.com/callback')).toBe(false);
    expect(isValidWildcardRedirectUriPattern('https://example.*/callback')).toBe(false);
    expect(isValidWildcardRedirectUriPattern('https://app.example.com:*/cb')).toBe(false);
    expect(isValidWildcardRedirectUriPattern('not-a-url')).toBe(false);
  });
});

describe('redirectUriAllowed override', () => {
  const client = asClient({
    applicationType: 'web',
    redirectUris: ['https://*.example.com/callback', 'https://exact.example.org/cb'],
  });

  it('keeps exact matching for non-wildcard registrations', () => {
    expect(redirectUriAllowed.call(client, 'https://exact.example.org/cb')).toBe(true);
    expect(redirectUriAllowed.call(client, 'https://exact.example.org/other')).toBe(false);
  });

  it('matches wildcard registrations for matching subdomains only', () => {
    expect(redirectUriAllowed.call(client, 'https://tenant.example.com/callback')).toBe(true);
    expect(redirectUriAllowed.call(client, 'https://tenant.example.net/callback')).toBe(false);
  });

  it('rejects candidate values containing a wildcard, including the registered pattern itself', () => {
    expect(redirectUriAllowed.call(client, 'https://*.example.com/callback')).toBe(false);
  });

  it('keeps port-insensitive loopback matching for native clients', () => {
    const nativeClient = asClient({
      applicationType: 'native',
      redirectUris: ['http://127.0.0.1:3000/cb'],
    });

    expect(redirectUriAllowed.call(nativeClient, 'http://127.0.0.1:49152/cb')).toBe(true);
    expect(redirectUriAllowed.call(nativeClient, 'http://192.168.0.1:49152/cb')).toBe(false);
  });

  it('keeps the loopback retry native-only for registered applications', () => {
    const webClient = asClient({
      applicationType: 'web',
      redirectUris: ['http://localhost/cb'],
    });

    expect(redirectUriAllowed.call(webClient, 'http://localhost:49152/cb')).toBe(false);
  });

  it('keeps normalized exact matching for registered applications', () => {
    const webClient = asClient({
      applicationType: 'web',
      redirectUris: ['https://exact.example.org:443/cb'],
    });

    expect(redirectUriAllowed.call(webClient, 'https://exact.example.org/cb')).toBe(true);
  });
});

describe('redirectUriAllowed override for cimd clients', () => {
  const cimdClient = asClient({
    clientId: 'https://client.example.com/oauth/metadata.json',
    redirectUris: ['https://app.example.com/callback', 'https://*.tenant.example.com/callback'],
  });

  it('matches on raw string equality only', () => {
    expect(redirectUriAllowed.call(cimdClient, 'https://app.example.com/callback')).toBe(true);
    expect(redirectUriAllowed.call(cimdClient, 'https://app.example.com/other')).toBe(false);
  });

  it('rejects values a normalized comparison would accept', () => {
    const client = asClient({
      clientId: 'https://client.example.com/oauth/metadata.json',
      redirectUris: [
        'https://a.example.com:443/cb',
        'https://B.example.com/cb',
        'https://c.example.com',
      ],
    });

    // Default-port stripping, hostname case folding, and trailing-slash insertion all change
    // the raw string, so none of these may match even though `new URL(...).href` equates them.
    expect(redirectUriAllowed.call(client, 'https://a.example.com/cb')).toBe(false);
    expect(redirectUriAllowed.call(client, 'https://b.example.com/cb')).toBe(false);
    expect(redirectUriAllowed.call(client, 'https://c.example.com/')).toBe(false);
  });

  it('keeps wildcard patterns matching as a non-standard extension', () => {
    expect(redirectUriAllowed.call(cimdClient, 'https://a.tenant.example.com/callback')).toBe(true);
    expect(redirectUriAllowed.call(cimdClient, 'https://a.b.tenant.example.com/callback')).toBe(
      false
    );
  });

  it('allows variable loopback ports regardless of application type', () => {
    // Claude Code's published metadata document: loopback redirect URIs without a port and no
    // application_type declaration (the schema defaults it to `web`).
    const claudeCode = asClient({
      clientId: 'https://claude.ai/oauth/claude-code-client-metadata',
      applicationType: 'web',
      redirectUris: ['http://localhost/callback', 'http://127.0.0.1/callback'],
    });

    expect(redirectUriAllowed.call(claudeCode, 'http://localhost:54321/callback')).toBe(true);
    expect(redirectUriAllowed.call(claudeCode, 'http://127.0.0.1:54321/callback')).toBe(true);
    expect(redirectUriAllowed.call(claudeCode, 'http://localhost:54321/other')).toBe(false);
    expect(redirectUriAllowed.call(claudeCode, 'http://192.168.0.1:54321/callback')).toBe(false);
    expect(redirectUriAllowed.call(claudeCode, 'https://localhost:54321/callback')).toBe(false);
  });

  it('keeps the loopback exception scoped to the port alone', () => {
    const client = asClient({
      clientId: 'https://client.example.com/oauth/metadata.json',
      redirectUris: ['http://LOCALHOST/cased', 'http://127.0.0.1:3000/cb', 'http://[::1]/v6'],
    });

    // Hostname casing stays significant — only the port position is exempt.
    expect(redirectUriAllowed.call(client, 'http://localhost:49152/cased')).toBe(false);
    // Ports are stripped from both sides, and IPv6 literals are handled.
    expect(redirectUriAllowed.call(client, 'http://127.0.0.1:49152/cb')).toBe(true);
    expect(redirectUriAllowed.call(client, 'http://[::1]:49152/v6')).toBe(true);
  });

  it('treats an explicit default port as strippable on both sides', () => {
    const client = asClient({
      clientId: 'https://client.example.com/oauth/metadata.json',
      redirectUris: ['http://localhost:80/cb', 'http://127.0.0.1/p80'],
    });

    // WHATWG reports an explicit `:80` as an empty port; it must still strip like any other.
    expect(redirectUriAllowed.call(client, 'http://localhost:49152/cb')).toBe(true);
    expect(redirectUriAllowed.call(client, 'http://127.0.0.1:80/p80')).toBe(true);
  });

  it('does not treat path content after a backslash as a strippable port', () => {
    const client = asClient({
      clientId: 'https://client.example.com/oauth/metadata.json',
      redirectUris: [String.raw`http://localhost\/cb`],
    });

    // WHATWG parsing turns `\` into a path separator, so the request has no port at all —
    // stripping `:49152` would silently ignore a real path difference.
    expect(redirectUriAllowed.call(client, String.raw`http://localhost\:49152/cb`)).toBe(false);
  });
});

describe('postLogoutRedirectUriAllowed override', () => {
  const client = asClient({
    applicationType: 'web',
    postLogoutRedirectUris: ['https://*.example.com/signed-out'],
  });

  it('matches wildcard registrations for matching subdomains only', () => {
    expect(postLogoutRedirectUriAllowed.call(client, 'https://tenant.example.com/signed-out')).toBe(
      true
    );
    expect(postLogoutRedirectUriAllowed.call(client, 'https://tenant.example.net/signed-out')).toBe(
      false
    );
  });

  it('rejects candidate values containing a wildcard', () => {
    expect(postLogoutRedirectUriAllowed.call(client, 'https://*.example.com/signed-out')).toBe(
      false
    );
  });

  it('keeps normalized matching without a loopback retry for registered applications', () => {
    const nativeClient = asClient({
      applicationType: 'native',
      postLogoutRedirectUris: ['https://app.example.com:443/signed-out', 'http://localhost/bye'],
    });

    expect(
      postLogoutRedirectUriAllowed.call(nativeClient, 'https://app.example.com/signed-out')
    ).toBe(true);
    expect(postLogoutRedirectUriAllowed.call(nativeClient, 'http://localhost:49152/bye')).toBe(
      false
    );
  });

  it('applies raw-string matching without the loopback exception to cimd post-logout URIs', () => {
    const cimdClient = asClient({
      clientId: 'https://client.example.com/oauth/metadata.json',
      postLogoutRedirectUris: ['https://app.example.com:443/signed-out', 'http://localhost/bye'],
    });

    // Raw-string exact — no default-port normalization…
    expect(
      postLogoutRedirectUriAllowed.call(cimdClient, 'https://app.example.com:443/signed-out')
    ).toBe(true);
    expect(
      postLogoutRedirectUriAllowed.call(cimdClient, 'https://app.example.com/signed-out')
    ).toBe(false);
    // …and RP-Initiated Logout has no loopback exception: variable ports never match.
    expect(postLogoutRedirectUriAllowed.call(cimdClient, 'http://localhost/bye')).toBe(true);
    expect(postLogoutRedirectUriAllowed.call(cimdClient, 'http://localhost:49152/bye')).toBe(false);
  });
});

describe('getRedirectUriMatchType', () => {
  const client = asClient({
    applicationType: 'web',
    redirectUris: ['https://*.example.com/callback', 'https://exact.example.org/cb'],
  });

  it('classifies literal registrations as exact and pattern registrations as wildcard', () => {
    expect(getRedirectUriMatchType(client, 'https://exact.example.org/cb')).toBe('exact');
    expect(getRedirectUriMatchType(client, 'https://tenant.example.com/callback')).toBe('wildcard');
    expect(getRedirectUriMatchType(client, 'https://tenant.example.net/callback')).toBeUndefined();
  });

  it('prefers exact when a value matches both a literal and a pattern registration', () => {
    const overlapping = asClient({
      applicationType: 'web',
      redirectUris: ['https://*.example.com/callback', 'https://tenant.example.com/callback'],
    });

    expect(getRedirectUriMatchType(overlapping, 'https://tenant.example.com/callback')).toBe(
      'exact'
    );
  });

  it('rejects candidate values containing a wildcard or failing to parse', () => {
    expect(getRedirectUriMatchType(client, 'https://*.example.com/callback')).toBeUndefined();
    expect(getRedirectUriMatchType(client, 'not-a-url')).toBeUndefined();
  });

  it('classifies the loopback port retry as exact for native registered applications only', () => {
    const nativeClient = asClient({
      applicationType: 'native',
      redirectUris: ['http://127.0.0.1:3000/cb'],
    });
    const webClient = asClient({
      applicationType: 'web',
      redirectUris: ['http://127.0.0.1:3000/cb'],
    });

    expect(getRedirectUriMatchType(nativeClient, 'http://127.0.0.1:49152/cb')).toBe('exact');
    expect(getRedirectUriMatchType(webClient, 'http://127.0.0.1:49152/cb')).toBeUndefined();
  });

  // DEV: CIMD (client ID metadata document) support
  it('classifies cimd raw-string and loopback matches as exact, patterns as wildcard', () => {
    const cimdClient = asClient({
      clientId: 'https://client.example.com/oauth/metadata.json',
      applicationType: 'web',
      redirectUris: [
        'https://app.example.com/callback',
        'https://*.tenant.example.com/callback',
        'http://localhost/cb',
      ],
    });

    expect(getRedirectUriMatchType(cimdClient, 'https://app.example.com/callback')).toBe('exact');
    // Raw-string comparison: normalized-equal values stay unmatched.
    expect(
      getRedirectUriMatchType(cimdClient, 'https://app.example.com:443/callback')
    ).toBeUndefined();
    expect(getRedirectUriMatchType(cimdClient, 'https://a.tenant.example.com/callback')).toBe(
      'wildcard'
    );
    // The shape-based loopback retry stays exact: the registered value is a literal URI.
    expect(getRedirectUriMatchType(cimdClient, 'http://localhost:49152/cb')).toBe('exact');
  });
});
