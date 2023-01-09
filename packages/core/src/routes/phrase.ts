import { isBuiltInLanguageTag } from '@logto/phrases-ui';
import { adminConsoleApplicationId, adminConsoleSignInExperience } from '@logto/schemas';

import detectLanguage from '#src/i18n/detect-language.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

export default function phraseRoutes<T extends AnonymousRouter>(
  ...[router, { provider, queries, libraries }]: RouterInitArgs<T>
) {
  const {
    customPhrases: { findAllCustomLanguageTags },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;
  const { getPhrases } = libraries.phrases;

  const getLanguageInfo = async (applicationId: unknown) => {
    if (applicationId === adminConsoleApplicationId) {
      return adminConsoleSignInExperience.languageInfo;
    }

    const { languageInfo } = await findDefaultSignInExperience();

    return languageInfo;
  };

  router.get('/phrase', async (ctx, next) => {
    const interaction = await provider
      .interactionDetails(ctx.req, ctx.res)
      // Should not block when failed to get interaction
      .catch(() => null);

    const applicationId = interaction?.params.client_id;
    const { autoDetect, fallbackLanguage } = await getLanguageInfo(applicationId);

    const detectedLanguages = autoDetect ? detectLanguage(ctx) : [];
    const acceptableLanguages = [...detectedLanguages, fallbackLanguage];
    const customLanguages = await findAllCustomLanguageTags();
    const language =
      acceptableLanguages.find(
        (tag) => isBuiltInLanguageTag(tag) || customLanguages.includes(tag)
      ) ?? 'en';

    ctx.set('Content-Language', language);
    ctx.body = await getPhrases(language, customLanguages);

    return next();
  });
}
