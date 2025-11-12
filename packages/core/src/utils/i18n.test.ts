import type { ParameterizedContext } from 'koa';

import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import { getExperienceLanguage } from './i18n.js';

const baseLanguageInfo = {
  autoDetect: true,
  fallbackLanguage: 'en',
} as const;

describe('getExperienceLanguage', () => {
  it('should fallback to built-in regional variant when base language requested', () => {
    const ctx = createMockContext({
      headers: { 'accept-language': 'pl' },
    }) as ParameterizedContext<any, any, any>;

    const language = getExperienceLanguage({
      ctx,
      languageInfo: baseLanguageInfo,
      customLanguages: [],
    });

    expect(language).toBe('pl-PL');
  });

  it('should respect custom languages with best match', () => {
    const ctx = createMockContext({
      headers: { 'accept-language': 'fi' },
    }) as ParameterizedContext<any, any, any>;

    const language = getExperienceLanguage({
      ctx,
      languageInfo: baseLanguageInfo,
      customLanguages: ['fi-FI'],
    });

    expect(language).toBe('fi-FI');
  });

  it('should fallback to default when no match found', () => {
    const ctx = createMockContext({
      headers: { 'accept-language': 'xx' },
    }) as ParameterizedContext<any, any, any>;

    const language = getExperienceLanguage({
      ctx,
      languageInfo: baseLanguageInfo,
      customLanguages: [],
    });

    expect(language).toBe('en');
  });
});
