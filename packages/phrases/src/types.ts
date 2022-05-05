/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

/* Copied from i18next/index.d.ts */
export type Resource = Record<Language, ResourceLanguage>;

export interface ResourceLanguage {
  [namespace: string]: ResourceKey;
}

export type ResourceKey = string | { [key: string]: any };

export enum Language {
  English = 'en',
  Chinese = 'zh-CN',
}

/* eslint-enable @typescript-eslint/consistent-indexed-object-style */
