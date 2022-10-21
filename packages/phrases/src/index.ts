import { fallback } from '@logto/core-kit';
import type { LanguageTag } from '@logto/language-kit';
import { languages } from '@logto/language-kit';
import type { NormalizeKeyPaths } from '@silverhand/essentials';
import { z } from 'zod';

import en from './locales/en';
import fr from './locales/fr';
import koKR from './locales/ko-kr';
import ptPT from './locales/pt-pt';
import trTR from './locales/tr-tr';
import zhCN from './locales/zh-cn';
import type { LocalPhrase } from './types';

export type { LocalPhrase } from './types';

export type I18nKey = NormalizeKeyPaths<typeof en.translation>;

export const builtInLanguages = ['en', 'fr', 'pt-PT', 'zh-CN', 'ko-KR', 'tr-TR'] as const;

export const builtInLanguageOptions = builtInLanguages.map((languageTag) => ({
  value: languageTag,
  title: languages[languageTag],
}));

export const builtInLanguageTagGuard = z.enum(builtInLanguages);

export type BuiltInLanguageTag = z.infer<typeof builtInLanguageTagGuard>;

export type Errors = typeof en.errors;
export type LogtoErrorCode = NormalizeKeyPaths<Errors>;
export type LogtoErrorI18nKey = `errors:${LogtoErrorCode}`;

export type AdminConsoleKey = NormalizeKeyPaths<typeof en.translation.admin_console>;

export const getDefaultLanguageTag = (languages: string): LanguageTag =>
  builtInLanguageTagGuard.or(fallback<LanguageTag>('en')).parse(languages);

export const isBuiltInLanguageTag = (language: string): language is BuiltInLanguageTag =>
  builtInLanguageTagGuard.safeParse(language).success;

export type Resource = Record<BuiltInLanguageTag, LocalPhrase>;

const resource: Resource = {
  en,
  fr,
  'pt-PT': ptPT,
  'zh-CN': zhCN,
  'ko-KR': koKR,
  'tr-TR': trTR,
};

export default resource;
