import { LanguageKey, languageKeyGuard } from '@logto/core-kit';

/* Copied from i18next/index.d.ts */
export type Resource = Record<LanguageKey, ResourceLanguage>;

export type ResourceLanguage = Record<string, ResourceKey>;

export type ResourceKey = string | Record<string, unknown>;

const languageCodeAndDisplayNameMappings: Record<LanguageKey, string> = {
  en: 'English',
  fr: 'Français',
  'pt-PT': 'Português',
  'zh-CN': '简体中文',
  'tr-TR': 'Türkçe',
  'ko-KR': '한국어',
};

export const languageOptions: Array<{ value: LanguageKey; title: string }> = Object.entries(
  languageCodeAndDisplayNameMappings
).map(([key, value]) => ({ value: languageKeyGuard.parse(key), title: value }));
