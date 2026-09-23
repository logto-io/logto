import { Theme } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

import { buildSharedExperienceCookie, parseSharedExperienceParams } from './utils.js';

describe('theme authentication parameter dev feature guard', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

  afterEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('should read the theme when dev features are enabled', () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);

    expect(parseSharedExperienceParams({ theme: 'dark' })).toEqual({ theme: 'dark' });
  });

  it('should ignore the theme when dev features are disabled', () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    expect(parseSharedExperienceParams({ theme: 'dark', organization_id: 'org_123' })).toEqual({
      organizationId: 'org_123',
    });
  });

  /**
   * The cookie is what carries the override across the redirects of one flow (reload, social
   * callback, consent) and what a later authentication request overwrites.
   */
  it('should carry the theme in the shared experience cookie', () => {
    expect(buildSharedExperienceCookie({ appId: 'app_123', theme: Theme.Dark })).toEqual({
      appId: 'app_123',
      theme: Theme.Dark,
    });
  });

  it('should omit the theme from the cookie when the request carries none', () => {
    expect(buildSharedExperienceCookie({ appId: 'app_123' })).toEqual({ appId: 'app_123' });
  });
});
