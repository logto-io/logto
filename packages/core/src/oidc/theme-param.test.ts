import { EnvSet } from '#src/env-set/index.js';

import { parseSharedExperienceParams } from './utils.js';

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
});
