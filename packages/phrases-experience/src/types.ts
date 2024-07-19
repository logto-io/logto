import type en from './locales/en/index.js';

type FlattenKeys<
  T,
  Prefix extends string = '',
  D extends number = 11, // Depth limit is actually 10, since the initial value of A is [0]
  A extends unknown[] = [0],
> = A['length'] extends D
  ? never
  : {
      [K in keyof T]: T[K] extends Record<string, unknown>
        ? `${Prefix}${string & K}.${FlattenKeys<T[K], '', D, [0, ...A]>}`
        : `${Prefix}${string & K}`;
    }[keyof T];

export type LocalePhrase = typeof en;

export type LocalePhraseGroupKey = keyof LocalePhrase['translation'];

export type LocalePhraseKey = FlattenKeys<LocalePhrase['translation']>;
