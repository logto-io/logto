import { fallback } from '@logto/core-kit';
import type { LanguageTag } from '@logto/language-kit';
import { languages } from '@logto/language-kit';
import type { NormalizeKeyPaths } from '@silverhand/essentials';
import { z } from 'zod';

import de from './locales/de';
import en from './locales/en';
import fr from './locales/fr';
import ko from './locales/ko';
import ptPT from './locales/pt-pt';
import trTR from './locales/tr-tr';
import zhCN from './locales/zh-cn';
import type { LocalPhrase } from './types';

export type { LocalPhrase } from './types';

export type I18nKey = NormalizeKeyPaths<typeof en.translation>;

export const builtInLanguages = ['de', 'en', 'fr', 'ko', 'pt-PT', 'tr-TR', 'zh-CN'] as const;

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
  de,
  en,
  fr,
  ko,
  'pt-PT': ptPT,
  'tr-TR': trTR,
  'zh-CN': zhCN,
};

export default resource;
