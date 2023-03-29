import type { LanguageTag } from '@logto/language-kit';
import { languages, fallback } from '@logto/language-kit';
import type { NormalizeKeyPaths } from '@silverhand/essentials';
import { z } from 'zod';

import de from './locales/de.js';
import en from './locales/en/index.js';
import fr from './locales/fr.js';
import ja from './locales/ja/index.js';
import ko from './locales/ko.js';
import ptBR from './locales/pt-br.js';
import ptPT from './locales/pt-pt.js';
import ru from './locales/ru.js';
import trTR from './locales/tr-tr.js';
import zhCN from './locales/zh-cn.js';
import type { LocalePhrase } from './types.js';

export type { LocalePhrase } from './types.js';

export type I18nKey = NormalizeKeyPaths<typeof en.translation>;

export const builtInLanguages = [
  'de',
  'en',
  'fr',
  'ko',
  'pt-PT',
  'pt-BR',
  'ru',
  'tr-TR',
  'zh-CN',
  'ja',
] as const;

export const builtInLanguageOptions = builtInLanguages.map((languageTag) => ({
  value: languageTag,
  title: languages[languageTag],
}));

export const builtInLanguageTagGuard = z.enum(builtInLanguages);

export type BuiltInLanguageTag = z.infer<typeof builtInLanguageTagGuard>;

export type Resource = Record<BuiltInLanguageTag, LocalePhrase>;

const resource: Resource = {
  de,
  en,
  fr,
  ko,
  'pt-PT': ptPT,
  'pt-BR': ptBR,
  ru,
  'tr-TR': trTR,
  'zh-CN': zhCN,
  ja,
};

export const getDefaultLanguageTag = (language: string): LanguageTag =>
  builtInLanguageTagGuard.or(fallback<LanguageTag>('en')).parse(language);

export const isBuiltInLanguageTag = (language: string): language is BuiltInLanguageTag =>
  builtInLanguageTagGuard.safeParse(language).success;

export default resource;
