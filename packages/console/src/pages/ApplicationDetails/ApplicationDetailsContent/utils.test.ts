import { applicationFormDataParser } from './utils';

describe('application redirect URI request mapping', () => {
  it.each([
    'https://example.com/callback/%E4%B8%AD%E6%96%87',
    'https://example.com/callback?next=a%26b%3Dc',
    'https://example.com/a%2Fb',
    'https://example.com/中文',
    'myapp://callback/%25',
    'https://example.com/100%',
  ])('preserves the exact redirect URI %s', (uri) => {
    const payload = applicationFormDataParser.toRequestPayload({
      name: 'Test app',
      oidcClientMetadata: {
        redirectUris: [uri],
        postLogoutRedirectUris: [uri],
      },
    });

    expect(payload.oidcClientMetadata?.redirectUris).toEqual([uri]);
    expect(payload.oidcClientMetadata?.postLogoutRedirectUris).toEqual([uri]);
  });

  it('still filters empty redirect URI rows', () => {
    const uri = 'https://example.com/callback';
    const payload = applicationFormDataParser.toRequestPayload({
      name: 'Test app',
      oidcClientMetadata: {
        redirectUris: ['', uri, ''],
        postLogoutRedirectUris: ['', uri],
      },
    });

    expect(payload.oidcClientMetadata?.redirectUris).toEqual([uri]);
    expect(payload.oidcClientMetadata?.postLogoutRedirectUris).toEqual([uri]);
  });

  it('allows unset redirect URI lists', () => {
    const payload = applicationFormDataParser.toRequestPayload({ name: 'Test app' });
    expect(payload.oidcClientMetadata?.redirectUris).toBeUndefined();
    expect(payload.oidcClientMetadata?.postLogoutRedirectUris).toBeUndefined();
  });
});

const mapCorsAllowedOrigins = (corsAllowedOrigins?: string[]) =>
  applicationFormDataParser.toRequestPayload({
    name: 'Test app',
    customClientMetadata: { corsAllowedOrigins },
  }).customClientMetadata?.corsAllowedOrigins;

describe('application CORS allowed origin request mapping', () => {
  it.each([
    ['https://example.com/', 'https://example.com'],
    ['https://example.com///', 'https://example.com'],
    ['http://localhost:3000/', 'http://localhost:3000'],
    ['chrome-extension://abcdefg/', 'chrome-extension://abcdefg'],
  ])('removes trailing slashes from %s', (origin, expected) => {
    expect(mapCorsAllowedOrigins([origin])).toEqual([expected]);
  });

  it.each(['https://%E4%B8%AD%E6%96%87.com', 'https://example.com%3A3000'])(
    'does not decode %s',
    (origin) => {
      expect(mapCorsAllowedOrigins([origin])).toEqual([origin]);
    }
  );

  it('does not throw on a literal percent sign', () => {
    expect(mapCorsAllowedOrigins(['https://example.com/100%'])).toEqual([
      'https://example.com/100%',
    ]);
  });

  it('still filters empty rows', () => {
    expect(mapCorsAllowedOrigins(['', 'https://example.com', ''])).toEqual(['https://example.com']);
  });

  it('allows an unset list', () => {
    expect(mapCorsAllowedOrigins()).toBeUndefined();
  });
});
