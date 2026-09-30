import { describe, expect, it } from 'vitest';

import { ExtraParamsKey, FirstScreen, extraParamsObjectGuard } from './oidc.js';

describe('extraParamsObjectGuard', () => {
  it('should keep the other parameters when the theme is not a supported value', () => {
    // Core parses every extra param in one call and falls back to an empty object when the
    // parse throws, so a loose value here must never discard the parameters next to it.
    const params = extraParamsObjectGuard.parse({
      [ExtraParamsKey.Theme]: 'sepia',
      [ExtraParamsKey.FirstScreen]: FirstScreen.Register,
      [ExtraParamsKey.LoginHint]: 'foo@logto.io',
    });

    expect(params[ExtraParamsKey.FirstScreen]).toBe(FirstScreen.Register);
    expect(params[ExtraParamsKey.LoginHint]).toBe('foo@logto.io');
  });
});
