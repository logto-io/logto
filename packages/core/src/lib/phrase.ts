import resource, { isBuiltInLanguageTag, LocalePhrase } from '@logto/phrases-ui';
import { CustomPhrase } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import deepmerge from 'deepmerge';

import { findCustomPhraseByLanguageTag } from '@/queries/custom-phrase';

export const getPhrase = async (supportedLanguage: string, customLanguages: string[]) => {
  if (!isBuiltInLanguageTag(supportedLanguage)) {
    return deepmerge<LocalePhrase, CustomPhrase>(
      resource.en,
      cleanDeep(await findCustomPhraseByLanguageTag(supportedLanguage))
    );
  }

  if (!customLanguages.includes(supportedLanguage)) {
    return resource[supportedLanguage];
  }

  return deepmerge<LocalePhrase, CustomPhrase>(
    resource[supportedLanguage],
    cleanDeep(await findCustomPhraseByLanguageTag(supportedLanguage))
  );
};
