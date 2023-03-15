import type { LocalePhrase } from '@logto/phrases-ui';
import resource, { isBuiltInLanguageTag } from '@logto/phrases-ui';
import type { CustomPhrase } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import deepmerge from 'deepmerge';

import { wellKnownCache } from '#src/caches/well-known.js';
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

  const getPhrases = wellKnownCache.use(tenantId, 'phrases', _getPhrases);

  const getAllCustomLanguageTags = wellKnownCache.use(
    tenantId,
    'phrases-lng-tags',
    findAllCustomLanguageTags
  );

  return {
    /** NOTE: This function is cached by the first parameter. */
    getPhrases,
    /** NOTE: This function is cached. */
    getAllCustomLanguageTags,
  };
};
