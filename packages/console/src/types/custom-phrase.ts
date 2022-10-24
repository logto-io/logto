import type { LanguageTag } from '@logto/language-kit';
import type { Translation } from '@logto/schemas';

export type CustomPhraseResponse = {
  languageTag: LanguageTag;
  translation: Translation;
};
