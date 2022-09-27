import { LanguageKey, languageKeyGuard } from '@logto/core-kit';

import en from './locales/en';

export type LocalePhrase = typeof en;
export type Resource = Record<LanguageKey, LocalePhrase>;

export const languageCodeAndDisplayNameMappings: Record<LanguageKey, string> = {
  en: 'English',
  fr: 'Français',
  'pt-PT': 'Português',
  'zh-CN': '简体中文',
  'tr-TR': 'Türkçe',
  'ko-KR': '한국어',
};

export const languageOptions = Object.entries(languageCodeAndDisplayNameMappings).map(
  ([key, value]) => ({ value: languageKeyGuard.parse(key), title: value })
);
