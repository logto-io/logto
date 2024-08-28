import type en from './locales/en/index.js';

type FlattenKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? `${Prefix}${string & K}.${FlattenKeys<T[K]>}`
    : `${Prefix}${string & K}`;
}[keyof T];

export type LocalePhrase = typeof en;

export type LocalePhraseGroupKey = keyof LocalePhrase['translation'];

export type LocalePhraseKey = FlattenKeys<LocalePhrase['translation']>;
