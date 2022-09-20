import type { LanguageKey } from '@logto/core-kit';
import type { Translation as UiTranslation } from '@logto/phrases-ui';

export type CustomPhraseResponse = {
  languageKey: LanguageKey;
  translation: UiTranslation;
};
