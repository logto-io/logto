import type { LanguageTag } from '@logto/language-kit';
import { languages, fallback } from '@logto/language-kit';
import type { DeepPartial, NormalizeKeyPaths } from '@silverhand/essentials';
import { z } from 'zod';

import ar from './locales/ar/index.js';
import de from './locales/de/index.js';
import en from './locales/en/index.js';
import es from './locales/es/index.js';
import fr from './locales/fr/index.js';
import it from './locales/it/index.js';
import ja from './locales/ja/index.js';
import ko from './locales/ko/index.js';
import plPL from './locales/pl-pl/index.js';
import ptBR from './locales/pt-br/index.js';
import ptPT from './locales/pt-pt/index.js';
import ru from './locales/ru/index.js';
import th from './locales/th/index.js';
import trTR from './locales/tr-tr/index.js';
import zhCN from './locales/zh-cn/index.js';
import zhHK from './locales/zh-hk/index.js';
import zhTW from './locales/zh-tw/index.js';
import type { LocalePhrase } from './types.js';

export type { LocalePhrase } from './types.js';

export type DefaultLocale = 'en';
export type I18nKey = NormalizeKeyPaths<typeof en.translation>;

export const builtInLanguages = [
  'ar',
  'de',
  'en',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'ru',
  'th',
  'tr-TR',
  'zh-CN',
  'zh-HK',
  'zh-TW',
] as const;

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

export type Resource = Record<
  Exclude<BuiltInLanguageTag, DefaultLocale>,
  DeepPartial<LocalePhrase>
> & {
  [key in DefaultLocale]: LocalePhrase;
};

const resource: Resource = {
  ar,
  de,
  en,
  es,
  fr,
  it,
  ja,
  ko,
  'pl-PL': plPL,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  ru,
  th,
  'tr-TR': trTR,
  'zh-CN': zhCN,
  'zh-HK': zhHK,
  'zh-TW': zhTW,
};

export default resource;
