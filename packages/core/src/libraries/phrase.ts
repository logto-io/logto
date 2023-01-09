import type { LocalePhrase } from '@logto/phrases-ui';
import resource, { isBuiltInLanguageTag } from '@logto/phrases-ui';
import type { CustomPhrase } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import deepmerge from 'deepmerge';

import type Queries from '#src/tenants/Queries.js';

export const createPhraseLibrary = (queries: Queries) => {
  const { findCustomPhraseByLanguageTag } = queries.customPhrases;

  const getPhrases = async (supportedLanguage: string, customLanguages: string[]) => {
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

  return { getPhrases };
};
