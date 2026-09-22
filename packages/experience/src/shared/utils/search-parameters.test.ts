import { Theme } from '@logto/schemas';

import {
  getThemeOverride,
  handleSearchParametersData,
  removeSearchParameters,
} from './search-parameters';

describe('search parameters utils', () => {
  afterEach(() => {
    window.history.replaceState(window.history.state, '', '/');
    sessionStorage.clear();
  });

  it('persists the theme override and strips it from the url', () => {
    window.history.pushState(window.history.state, '', '/sign-in?theme=dark');

    handleSearchParametersData();

    expect(getThemeOverride()).toBe(Theme.Dark);
    expect(window.location.search).toBe('');
  });

  it('clears a stored theme when a new flow arrives without the param', () => {
    sessionStorage.setItem('theme', Theme.Dark);
    window.history.pushState(window.history.state, '', '/sign-in?app_id=app_123');

    handleSearchParametersData();

    expect(getThemeOverride()).toBeUndefined();
  });

  it('clears a stored theme when a fresh flow arrives with no search params at all', () => {
    // Core redirects a plain device flow to a bare `/device`, which must not inherit the theme
    // of whatever flow ran in this tab before it.
    sessionStorage.setItem('theme', Theme.Dark);
    window.history.pushState(window.history.state, '', '/device');

    handleSearchParametersData();

    expect(getThemeOverride()).toBeUndefined();
  });

  it('ignores an unsupported theme value', () => {
    window.history.pushState(window.history.state, '', '/sign-in?theme=sepia');

    handleSearchParametersData();

    expect(getThemeOverride()).toBeUndefined();
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
});
