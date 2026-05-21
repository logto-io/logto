import { getAccountCenterInternalRoute } from './account-center-internal-route';

const origin = 'https://auth.example.com';

describe('getAccountCenterInternalRoute', () => {
  it('returns a router path for same-origin account center URLs', () => {
    expect(getAccountCenterInternalRoute(`${origin}/account`, origin)).toBe('/');
    expect(getAccountCenterInternalRoute(`${origin}/account/`, origin)).toBe('/');
    expect(getAccountCenterInternalRoute(`${origin}/account/security`, origin)).toBe('/security');
    expect(
      getAccountCenterInternalRoute(`${origin}/account/security?foo=bar#profile`, origin)
    ).toBe('/security?foo=bar#profile');
  });

  it('supports relative account center URLs', () => {
    expect(getAccountCenterInternalRoute('/account/username/success', origin)).toBe(
      '/username/success'
    );
  });

  it('ignores non-account-center URLs', () => {
    expect(getAccountCenterInternalRoute(`${origin}/accounting`, origin)).toBeUndefined();
    expect(getAccountCenterInternalRoute(`${origin}/console`, origin)).toBeUndefined();
    expect(
      getAccountCenterInternalRoute('https://external.example.com/account/security', origin)
    ).toBeUndefined();
  });

  it('ignores invalid URLs', () => {
    expect(getAccountCenterInternalRoute('http://[', origin)).toBeUndefined();
    expect(getAccountCenterInternalRoute('/account/security', 'not-a-url')).toBeUndefined();
  });
});
