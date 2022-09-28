import { fallback } from '@logto/core-kit';
import { languages, LanguageTag } from '@logto/language-kit';
import { NormalizeKeyPaths } from '@silverhand/essentials';
import { z } from 'zod';

import en from './locales/en';
import fr from './locales/fr';
import koKR from './locales/ko-kr';
import ptPT from './locales/pt-pt';
import trTR from './locales/tr-tr';
import zhCN from './locales/zh-cn';
import { LocalePhrase } from './types';

export type { LocalePhrase } from './types';

export type I18nKey = NormalizeKeyPaths<typeof en.translation>;

export const builtInLanguages = ['en', 'fr', 'pt-PT', 'zh-CN', 'ko-KR', 'tr-TR'] as const;

export const builtInLanguageOptions = builtInLanguages.map((languageTag) => ({
  value: languageTag,
  title: languages[languageTag],
}));

export const builtInLanguageGuard = z.enum(builtInLanguages);

export type BuiltInLanguageTag = z.infer<typeof builtInLanguageGuard>;

export type Resource = Record<BuiltInLanguageTag, LocalePhrase>;

const resource: Resource = {
  en,
  fr,
  'pt-PT': ptPT,
  'zh-CN': zhCN,
  'ko-KR': koKR,
  'tr-TR': trTR,
};

export const getDefaultLanguageTag = (language: string): LanguageTag =>
  builtInLanguageGuard.or(fallback<LanguageTag>('en')).parse(language);

export const isBuiltInLanguageTag = (language: string): language is BuiltInLanguageTag =>
  builtInLanguageGuard.safeParse(language).success;

export default resource;
