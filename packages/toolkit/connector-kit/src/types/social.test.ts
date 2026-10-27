import { assert } from '@silverhand/essentials';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { jsonGuard, oidcPromptsGuard, OidcPrompt, tokenResponseGuard } from './social.js';

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

describe('tokenResponseGuard', () => {
  it('rejects a `scope` array with non-string elements', () => {
    expect(tokenResponseGuard.safeParse({ scope: ['chat:read', 1, null] }).success).toBe(false);
  });
});

describe('jsonGuard', () => {
  it('validates nested JSON values', () => {
    const value = { a: [1, 'b', true, null, { c: [[{ d: 'e' }]] }] };
    expect(jsonGuard.parse(value)).toEqual(value);
    expect(jsonGuard.safeParse({ a: [{ b: undefined }] }).success).toBe(false);
  });

  it('reuses one union schema across lazy evaluations', () => {
    assert(jsonGuard instanceof z.ZodLazy, new Error('jsonGuard should be a lazy schema'));
    expect(jsonGuard.schema).toBe(jsonGuard.schema);
  });
});
