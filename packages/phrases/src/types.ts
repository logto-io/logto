/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { z } from 'zod';

/* Copied from i18next/index.d.ts */
export type Resource = Record<Language, ResourceLanguage>;

export interface ResourceLanguage {
  [namespace: string]: ResourceKey;
}

export type ResourceKey = string | { [key: string]: unknown };

export enum Language {
  English = 'en',
  Chinese = 'zh-CN',
  Turkish = 'tr-TR',
}

export const languageEnumGuard = z.nativeEnum(Language);

export const languageOptions = [
  { value: Language.English, title: 'English' },
  { value: Language.Chinese, title: '中文' },
  { value: Language.Turkish, title: 'Türkçe' },
];

/* eslint-enable @typescript-eslint/consistent-indexed-object-style */
