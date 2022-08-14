/* Copied from i18next/index.d.ts */
export type Resource = Record<Language, ResourceLanguage>;

export type ResourceLanguage = Record<string, ResourceKey>;

export type ResourceKey = string | Record<string, unknown>;

export enum Language {
  English = 'en',
  French = 'fr',
  Chinese = 'zh-CN',
  Turkish = 'tr-TR',
  Korean = 'ko-KR',
}

const languageCodeAndDisplayNameMappings: Record<Language, string> = {
  [Language.English]: 'English',
  [Language.French]: 'Français',
  [Language.Chinese]: '简体中文',
  [Language.Turkish]: 'Türkçe',
  [Language.Korean]: '한국어',
};

export const languageOptions = Object.entries(languageCodeAndDisplayNameMappings)
  .filter((entry): entry is [Language, string] =>
    Object.values<string>(Language).includes(entry[0])
  )
  .map(([key, value]) => ({ value: key, title: value }));
