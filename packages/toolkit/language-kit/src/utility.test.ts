import { describe, expect, it } from 'vitest';
import { number, ZodError } from 'zod';

import {
  canonicalizeLanguageTag,
  fallback,
  findSupportedLanguageTag,
  isLanguageTag,
  matchSupportedLanguageTag,
  languageTagGuard,
} from './utility.js';

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

describe('canonicalizeLanguageTag', () => {
  it('should canonicalize valid language tags', () => {
    expect(canonicalizeLanguageTag('en-us')).toBe('en-US');
    expect(canonicalizeLanguageTag('pt_br')).toBe('pt-BR');
  });

  it('should return undefined for invalid input', () => {
    expect(canonicalizeLanguageTag('*')).toBeUndefined();
    expect(canonicalizeLanguageTag('')).toBeUndefined();
  });
});

describe('findSupportedLanguageTag', () => {
  const supported = ['en', 'fr', 'pl-PL', 'zh-CN', 'zh-HK'];

  it('should return direct match when available', () => {
    expect(findSupportedLanguageTag(['fr'], supported)).toBe('fr');
  });

  it('should fallback to regional variant when exact language is missing', () => {
    expect(findSupportedLanguageTag(['pl'], supported)).toBe('pl-PL');
  });

  it('should fallback to base language when region differs', () => {
    expect(findSupportedLanguageTag(['en-AU'], supported)).toBe('en');
  });

  it('should respect preference order', () => {
    expect(findSupportedLanguageTag(['de-DE', 'zh'], supported)).toBe('zh-CN');
  });

  it('should fallback to default when no match found', () => {
    expect(findSupportedLanguageTag(['xx', 'yy'], supported)).toBe('en');
  });
});

describe('matchSupportedLanguageTag', () => {
  const supported = ['en', 'zh-CN'];

  it('should return supported language when found', () => {
    expect(matchSupportedLanguageTag(['zh-HK'], supported).match).toBe('zh-CN');
  });

  it('should return undefined when no match found', () => {
    expect(matchSupportedLanguageTag(['de'], supported).match).toBeUndefined();
  });

  it('should return specific language when provided in params', () => {
    expect(matchSupportedLanguageTag(['fr'], supported).match).toBeUndefined(); // 'fr' not in supported
    expect(matchSupportedLanguageTag(['en'], supported).match).toBe('en'); // 'en' is in supported
    expect(matchSupportedLanguageTag(['zh-CN'], supported).match).toBe('zh-CN'); // Exact match
    expect(matchSupportedLanguageTag(['zh-HK'], supported).match).toBe('zh-CN'); // Base language fallback
    expect(matchSupportedLanguageTag(['fr', 'zh-CN'], supported).match).toBe('zh-CN');
  });
});
