import type { Provider } from 'oidc-provider';

import { createMockProvider } from '#src/test-utils/oidc-provider.js';

import { getRedirectUriMatchType, installWildcardRedirectUriMatching } from './index.js';
import { isValidWildcardRedirectUriPattern, wildcardUrlMatch } from './utils.js';

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

  it('rejects a plain URI without a wildcard', () => {
    expect(isValidWildcardRedirectUriPattern('https://app.example.com/callback')).toBe(false);
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
