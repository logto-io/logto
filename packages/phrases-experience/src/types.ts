import type en from './locales/en/index.js';

type FlattenKeys<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends Record<string, unknown>
      ? `${K}.${FlattenKeys<T[K]>}`
      : `${K}`
    : never;
}[keyof T];

export type LocalePhrase = typeof en;

export type LocalePhraseGroupKey = keyof LocalePhrase['translation'];

export type LocalePhraseKey = FlattenKeys<LocalePhrase['translation']>;
