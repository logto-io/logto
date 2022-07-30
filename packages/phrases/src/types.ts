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
  Korean = 'ko-KR',
}

export const languageEnumGuard = z.nativeEnum(Language);

const languageCodeAndDisplayNameMappings: Record<Language, string> = {
  [Language.English]: 'English',
  [Language.Chinese]: '中文',
  [Language.Turkish]: 'Türkçe',
  [Language.Korean]: '한국어',
};

export const languageOptions = Object.entries(languageCodeAndDisplayNameMappings).map(
  ([key, value]) => ({ value: key, title: value })
);

/* eslint-enable @typescript-eslint/consistent-indexed-object-style */
