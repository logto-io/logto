import type en from './locales/en/index.js';

export type LocalePhrase = typeof en;

export type LocalePhraseGroupKey = keyof LocalePhrase['translation'];

export type LocalePhraseKey<T extends LocalePhraseGroupKey> = keyof LocalePhrase['translation'][T];
