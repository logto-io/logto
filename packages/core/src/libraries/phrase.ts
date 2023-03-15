import type { LocalePhrase } from '@logto/phrases-ui';
import resource, { isBuiltInLanguageTag } from '@logto/phrases-ui';
import type { CustomPhrase } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import deepmerge from 'deepmerge';

import { useWellKnownCache } from '#src/caches/well-known.js';
import type Queries from '#src/tenants/Queries.js';

export const createPhraseLibrary = (queries: Queries, tenantId: string) => {
  const { findCustomPhraseByLanguageTag, findAllCustomLanguageTags } = queries.customPhrases;

  const _getPhrases = async (
    supportedLanguage: string,
    customLanguages: string[]
  ): Promise<LocalePhrase> => {
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

  const getPhrases = useWellKnownCache(tenantId, 'phrases', _getPhrases);

  const getAllCustomLanguageTags = useWellKnownCache(
    tenantId,
    'lng-tags',
    findAllCustomLanguageTags
  );

  return {
    /** NOTE: This function is cached by the first parameter. */
    getPhrases,
    /** NOTE: This function is cached. */
    getAllCustomLanguageTags,
  };
};
