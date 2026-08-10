import { getClientIdentifierHost, getRedirectUriOrigin } from './util';

describe('consent page utils', () => {
  it('getRedirectUriOrigin should return the origin if the redirectUri is a http url', () => {
    const redirectUri = 'https://logto.io/callback?code=123';
    const origin = getRedirectUriOrigin(redirectUri);
    expect(origin).toEqual('https://logto.io');
  });

  it('getRedirectUriOrigin should return the original uri if the redirectUri is not a http url', () => {
    const redirectUri = 'io.logto://callback?code=123';
    const origin = getRedirectUriOrigin(redirectUri);
    expect(origin).toEqual(redirectUri);
  });

  it('getClientIdentifierHost should drop the scheme and the path', () => {
    expect(getClientIdentifierHost('https://client.example.com/oauth/metadata.json')).toEqual(
      'client.example.com'
    );
  });

  it('getClientIdentifierHost should keep a non-default port', () => {
    expect(getClientIdentifierHost('https://client.example.com:8443/metadata.json')).toEqual(
      'client.example.com:8443'
    );
    expect(getClientIdentifierHost('https://client.example.com:443/metadata.json')).toEqual(
      'client.example.com'
    );
  });
});
