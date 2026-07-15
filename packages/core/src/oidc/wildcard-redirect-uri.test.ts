import type { Provider } from 'oidc-provider';

import { createMockProvider } from '#src/test-utils/oidc-provider.js';

import { installWildcardRedirectUriMatching, wildcardUrlMatch } from './wildcard-redirect-uri.js';

type ClientInstance = InstanceType<Provider['Client']>;

type ClientMetadataStub = {
  redirectUris?: string[];
  postLogoutRedirectUris?: string[];
  applicationType?: 'web' | 'native';
};

const provider = createMockProvider();
installWildcardRedirectUriMatching(provider);

const { redirectUriAllowed, postLogoutRedirectUriAllowed } = provider.Client.prototype;

const asClient = (metadata: ClientMetadataStub) => metadata as ClientInstance;

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
});
