import { isBuiltInLanguageTag } from '@logto/phrases-ui';
import { adminConsoleApplicationId, adminConsoleSignInExperience } from '@logto/schemas';
import { object, string } from 'zod';

import detectLanguage from '#src/i18n/detect-language.js';
import koaGuard from '#src/middleware/koa-guard.js';

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

  router.get(
    '/phrase',
    koaGuard({
      query: object({
        lng: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const interaction = await provider
        .interactionDetails(ctx.req, ctx.res)
        // Should not block when failed to get interaction
        .catch(() => null);

      const {
        query: { lng },
      } = ctx.guard;

      const applicationId = interaction?.params.client_id;
      const { autoDetect, fallbackLanguage } = await getLanguageInfo(applicationId);

      const targetLanguage = lng ? [lng] : [];
      const detectedLanguages = autoDetect ? detectLanguage(ctx) : [];
      const acceptableLanguages = [...targetLanguage, ...detectedLanguages, fallbackLanguage];
      const customLanguages = await findAllCustomLanguageTags();
      const language =
        acceptableLanguages.find(
          (tag) => isBuiltInLanguageTag(tag) || customLanguages.includes(tag)
        ) ?? 'en';

      console.log(language);

      ctx.set('Content-Language', language);
      ctx.body = await getPhrases(language, customLanguages);

      return next();
    }
  );
}
