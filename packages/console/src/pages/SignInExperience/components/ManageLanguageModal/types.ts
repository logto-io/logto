import type { LanguageKey } from '@logto/core-kit';
import type { Translation } from '@logto/schemas';

export type CustomPhraseResponse = {
  languageKey: LanguageKey;
  translation: Translation;
};
