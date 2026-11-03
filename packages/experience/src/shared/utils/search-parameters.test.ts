import { handleSearchParametersData, removeSearchParameters } from './search-parameters';

describe('search parameters utils', () => {
  afterEach(() => {
    window.history.replaceState(window.history.state, '', '/');
  });

  it('removes selected search parameters and preserves the rest', () => {
    window.history.pushState(
      window.history.state,
      '',
      '/reset-password?one_time_token=token&login_hint=foo%40logto.io&foo=bar#section'
    );

    removeSearchParameters(['one_time_token', 'login_hint']);

    expect(window.location.pathname).toBe('/reset-password');
    expect(window.location.search).toBe('?foo=bar');
    expect(window.location.hash).toBe('#section');
  });

  it('stores confirm_redirect and clears it when a later load does not pass it', () => {
    window.history.pushState(
      window.history.state,
      '',
      '/sign-in?app_id=foo&confirm_redirect=password'
    );
    handleSearchParametersData();

    expect(sessionStorage.getItem('confirm_redirect')).toBe('password');
    expect(window.location.search).toBe('?app_id=foo');

    window.history.pushState(window.history.state, '', '/sign-in?app_id=foo');
    handleSearchParametersData();

    expect(sessionStorage.getItem('confirm_redirect')).toBeNull();
  });

  it.each(['/callback/github', '/callback/social/github'])(
    'keeps confirm_redirect on a %s load',
    (pathname) => {
      sessionStorage.setItem('confirm_redirect', 'always');
      window.history.pushState(window.history.state, '', `${pathname}?code=foo&state=bar`);
      handleSearchParametersData();

      expect(sessionStorage.getItem('confirm_redirect')).toBe('always');
      expect(window.location.search).toBe('?code=foo&state=bar');
    }
  );
});
