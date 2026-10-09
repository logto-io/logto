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
