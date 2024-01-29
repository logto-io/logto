import { getRedirectUriOrigin } from './util';

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
});
