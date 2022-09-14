import { LanguageKey } from '@logto/core-kit';
import resource, { LocalePhrase } from '@logto/phrases-ui';
import { CustomPhrase } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import deepmerge from 'deepmerge';

import { findCustomPhraseByLanguageKey } from '@/queries/custom-phrase';

export const isBuiltInLanguage = (key: string): key is LanguageKey =>
  Object.keys(resource).includes(key);

export const getPhrase = async (supportedLanguage: string, customLanguages: string[]) => {
  if (!isBuiltInLanguage(supportedLanguage)) {
    return deepmerge<LocalePhrase, CustomPhrase>(
      resource.en,
      cleanDeep(await findCustomPhraseByLanguageKey(supportedLanguage))
    );
  }

  if (!customLanguages.includes(supportedLanguage)) {
    return resource[supportedLanguage];
  }

  return deepmerge<LocalePhrase, CustomPhrase>(
    resource[supportedLanguage],
    cleanDeep(await findCustomPhraseByLanguageKey(supportedLanguage))
  );
};
