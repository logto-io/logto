import type { ParameterizedContext } from 'koa';

import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import { getExperienceLanguage } from './i18n.js';

const baseLanguageInfo = {
  autoDetect: true,
  fallbackLanguage: 'en',
} as const;

describe('getExperienceLanguage', () => {
  it('should fallback to built-in regional variant when base language requested', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: { 'accept-language': 'pl' },
    });

    const language = getExperienceLanguage({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ctx,
      languageInfo: baseLanguageInfo,
      customLanguages: [],
    });

    expect(language).toBe('pl-PL');
  });

  it('should respect custom languages with best match', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: { 'accept-language': 'fi' },
    });

    const language = getExperienceLanguage({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ctx,
      languageInfo: baseLanguageInfo,
      customLanguages: ['fi-FI'],
    });

    expect(language).toBe('fi-FI');
  });

  it('should prefer built-in exact match over custom base-language fallback', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: { 'accept-language': 'zh-HK' },
    });

    const language = getExperienceLanguage({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ctx,
      languageInfo: baseLanguageInfo,
      customLanguages: ['zh-TW'],
    });

    expect(language).toBe('zh-HK');
  });

  it('should prefer built-in base-language fallback over custom base-language fallback', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: { 'accept-language': 'en-US' },
    });

    const language = getExperienceLanguage({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ctx,
      languageInfo: baseLanguageInfo,
      customLanguages: ['en-GB'],
    });

    expect(language).toBe('en');
  });

  it('should fallback to default when no match found', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: { 'accept-language': 'xx' },
    });

    const language = getExperienceLanguage({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ctx,
      languageInfo: baseLanguageInfo,
      customLanguages: [],
    });

    expect(language).toBe('en');
  });

  it('should fallback to default when configured fallback language is unsupported', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: { 'accept-language': 'xx-XX' },
    });

    const language = getExperienceLanguage({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ctx,
      languageInfo: {
        autoDetect: true,
        // @ts-expect-error
        fallbackLanguage: 'yy-YY',
      },
      customLanguages: [],
    });

    expect(language).toBe('en');
  });
});
