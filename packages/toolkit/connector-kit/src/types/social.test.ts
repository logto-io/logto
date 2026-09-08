import { describe, expect, it } from 'vitest';

import { OidcPrompt, oidcPromptsGuard } from './social.js';

describe('oidcPromptsGuard', () => {
  it('accepts each prompt on its own', () => {
    for (const prompt of Object.values(OidcPrompt)) {
      expect(oidcPromptsGuard.safeParse([prompt]).success).toBe(true);
    }
  });

  it('accepts combinations that do not include `none`', () => {
    expect(oidcPromptsGuard.safeParse([OidcPrompt.SelectAccount, OidcPrompt.Consent]).success).toBe(
      true
    );
    expect(
      oidcPromptsGuard.safeParse([OidcPrompt.Login, OidcPrompt.Consent, OidcPrompt.SelectAccount])
        .success
    ).toBe(true);
  });

  it('rejects `none` combined with any other prompt', () => {
    // OIDC Core 1.0 section 3.1.2.1: `none` with any other value is an error.
    expect(oidcPromptsGuard.safeParse([OidcPrompt.None, OidcPrompt.Consent]).success).toBe(false);
    expect(oidcPromptsGuard.safeParse([OidcPrompt.SelectAccount, OidcPrompt.None]).success).toBe(
      false
    );
    expect(
      oidcPromptsGuard.safeParse([OidcPrompt.SelectAccount, OidcPrompt.Consent, OidcPrompt.None])
        .success
    ).toBe(false);
  });

  it('still accepts an empty array and undefined', () => {
    expect(oidcPromptsGuard.safeParse([]).success).toBe(true);
    expect(oidcPromptsGuard.safeParse().success).toBe(true);
  });

  it('still rejects values outside the enum', () => {
    expect(oidcPromptsGuard.safeParse(['nope']).success).toBe(false);
  });
});
