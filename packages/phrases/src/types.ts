import { z } from 'zod';

/* Copied from i18next/index.d.ts */
export type Resource = Record<Language, ResourceLanguage>;

export type ResourceLanguage = Record<string, ResourceKey>;

export type ResourceKey = string | Record<string, unknown>;

export enum Language {
  English = 'en',
  Chinese = 'zh-CN',
  Turkish = 'tr-TR',
  Korean = 'ko-KR',
}

export const languageEnumGuard = z.nativeEnum(Language);

export const languageOptions = [
  { value: Language.English, title: 'English' },
  { value: Language.Chinese, title: '中文' },
  { value: Language.Turkish, title: 'Türkçe' },
  { value: Language.Korean, title: '한국어' },
];
