/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

/* Copied from i18next/index.d.ts */
export interface Resource {
  [language: string]: ResourceLanguage;
}

export interface ResourceLanguage {
  [namespace: string]: ResourceKey;
}

export type ResourceKey = string | { [key: string]: any };

/* eslint-enable @typescript-eslint/consistent-indexed-object-style */
