import { describe, expect, it } from 'vitest';

import { oidcPromptsGuard, OidcPrompt } from './social.js';

describe('oidcPromptsGuard', () => {
  it('allows valid prompt configurations, including undefined, single prompts, and combinations without none', () => {
    expect(oidcPromptsGuard.safeParse([OidcPrompt.None]).success).toBe(true);
    expect(oidcPromptsGuard.safeParse([OidcPrompt.Consent]).success).toBe(true);
    expect(oidcPromptsGuard.safeParse([OidcPrompt.SelectAccount, OidcPrompt.Consent]).success).toBe(
      true
    );
    // eslint-disable-next-line unicorn/no-useless-undefined -- undefined is a valid optional value under test
    expect(oidcPromptsGuard.safeParse(undefined).success).toBe(true);
  });

  it('rejects none when combined with other prompts', () => {
    const result = oidcPromptsGuard.safeParse([
      OidcPrompt.SelectAccount,
      OidcPrompt.Consent,
      OidcPrompt.None,
    ]);
    expect(result.success).toBe(false);
  });
});
