import { z } from 'zod';

import { fallback } from './utilities/zod';

export const languageKeys = ['en', 'fr', 'pt-PT', 'zh-CN', 'tr-TR', 'ko-KR'] as const;
export const languageKeyGuard = z.enum(languageKeys);
export type LanguageKey = z.infer<typeof languageKeyGuard>;

export const getDefaultLanguage = (language: string): LanguageKey => {
  return languageKeyGuard.or(fallback<LanguageKey>('en')).parse(language);
};
