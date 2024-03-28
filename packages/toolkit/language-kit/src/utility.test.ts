import { describe, expect, it } from 'vitest';
import { number, ZodError } from 'zod';

import { fallback, isLanguageTag, languageTagGuard } from './utility.js';

describe('isLanguageTag', () => {
  it('should pass when input is a valid language key', () => {
    expect(isLanguageTag('en-GB')).toBeTruthy();
    expect(isLanguageTag('zh-CN')).toBeTruthy();
  });

  it('should fail when input is not a valid language key', () => {
    for (const invalidLanguageKey of [undefined, '', 'xx-XX']) {
      expect(isLanguageTag(invalidLanguageKey)).toBeFalsy();
    }
  });
});

describe('languageTagGuard', () => {
  it('should pass when input is a valid language key', () => {
    expect(languageTagGuard.safeParse('en-GB').success).toBeTruthy();
    expect(languageTagGuard.safeParse('zh-CN').success).toBeTruthy();
  });

  it('should fail when input is not a valid language key', () => {
    for (const invalidLanguageKey of [undefined, '', 'xx-XX']) {
      expect(languageTagGuard.safeParse(invalidLanguageKey).success).toBeFalsy();
    }
  });
});

describe('fallback', () => {
  it('should fallback to default value', () => {
    const schema = number();
    const tolerant = schema.or(fallback(-1));

    expect(() => schema.parse('foo')).toThrow(ZodError);
    expect(tolerant.parse('foo')).toBe(-1);
  });
});
