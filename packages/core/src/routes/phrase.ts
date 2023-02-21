import { isBuiltInLanguageTag } from '@logto/phrases-ui';
import { object, string } from 'zod';

import detectLanguage from '#src/i18n/detect-language.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

export default function phraseRoutes<T extends AnonymousRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    customPhrases: { findAllCustomLanguageTags },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;
  const { getPhrases } = libraries.phrases;

  const getLanguageInfo = async () => {
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
      const {
        query: { lng },
      } = ctx.guard;

      const { autoDetect, fallbackLanguage } = await getLanguageInfo();

      const targetLanguage = lng ? [lng] : [];
      const detectedLanguages = autoDetect ? detectLanguage(ctx) : [];
      const acceptableLanguages = [...targetLanguage, ...detectedLanguages, fallbackLanguage];
      const customLanguages = await findAllCustomLanguageTags();
      const language =
        acceptableLanguages.find(
          (tag) => isBuiltInLanguageTag(tag) || customLanguages.includes(tag)
        ) ?? 'en';

      ctx.set('Content-Language', language);
      ctx.body = await getPhrases(language, customLanguages);

      return next();
    }
  );
}
