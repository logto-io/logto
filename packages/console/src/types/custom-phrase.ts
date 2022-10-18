import { LanguageTag } from '@logto/language-kit';
import { Translation } from '@logto/schemas';

export type CustomPhraseResponse = {
  languageTag: LanguageTag;
  translation: Translation;
};
