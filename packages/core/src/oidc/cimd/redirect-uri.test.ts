import type { Provider } from 'oidc-provider';

import { createMockProvider } from '#src/test-utils/oidc-provider.js';

import { installWildcardRedirectUriMatching } from '../redirect-uri/index.js';

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
    // The reverse direction: a port-less request matches a ported registration too.
    expect(redirectUriAllowed.call(client, 'http://127.0.0.1/cb')).toBe(true);
  });

  it('treats an explicit default port as strippable on both sides', () => {
    const client = asClient({
      clientId: 'https://client.example.com/oauth/metadata.json',
      redirectUris: ['http://localhost:80/cb', 'http://127.0.0.1/p80'],
    });

    // WHATWG reports an explicit `:80` as an empty port; it must still strip like any other.
    expect(redirectUriAllowed.call(client, 'http://localhost:49152/cb')).toBe(true);
    expect(redirectUriAllowed.call(client, 'http://127.0.0.1:80/p80')).toBe(true);
    // The reverse direction: a port-less request matches the explicitly ported registration.
    expect(redirectUriAllowed.call(client, 'http://localhost/cb')).toBe(true);
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

describe('postLogoutRedirectUriAllowed override for cimd clients', () => {
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
