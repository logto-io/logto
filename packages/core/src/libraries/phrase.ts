import type { LocalePhrase } from '@logto/phrases-ui';
import resource, { isBuiltInLanguageTag } from '@logto/phrases-ui';
import { trySafe } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import deepmerge from 'deepmerge';

import type Queries from '#src/tenants/Queries.js';

export const createPhraseLibrary = (queries: Queries) => {
  const { findCustomPhraseByLanguageTag, findAllCustomLanguageTags } = queries.customPhrases;

  const getPhrases = async (forLanguage: string): Promise<LocalePhrase> => {
    return deepmerge<LocalePhrase>(
      resource[isBuiltInLanguageTag(forLanguage) ? forLanguage : 'en'],
      cleanDeep((await trySafe(findCustomPhraseByLanguageTag(forLanguage))) ?? {})
    );
  };

  return {
    getPhrases,
    findAllCustomLanguageTags,
  };
};
