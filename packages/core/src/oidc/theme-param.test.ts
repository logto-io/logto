import { Theme } from '@logto/schemas';

import { buildSharedExperienceCookie } from './utils.js';

/**
 * The cookie is what carries the theme override across the redirects of one flow (reload, social
 * callback, consent) and what a later authentication request overwrites.
 */
describe('theme in the shared experience cookie', () => {
  it('should carry the theme', () => {
    expect(buildSharedExperienceCookie({ appId: 'app_123', theme: Theme.Dark })).toEqual({
      appId: 'app_123',
      theme: Theme.Dark,
    });
  });

  it('should omit the theme when the request carries none', () => {
    expect(buildSharedExperienceCookie({ appId: 'app_123' })).toEqual({ appId: 'app_123' });
  });
});
