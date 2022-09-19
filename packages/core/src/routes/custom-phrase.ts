import { CustomPhrases, translationGuard } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import {
  deleteCustomPhraseByLanguageKey,
  findAllCustomPhrases,
  findCustomPhraseByLanguageKey,
  upsertCustomPhrase,
} from '@/queries/custom-phrase';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';

import { AuthedRouter } from './types';

export default function customPhraseRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/custom-phrases',
    koaGuard({
      response: CustomPhrases.guard.array(),
    }),
    async (ctx, next) => {
      ctx.body = await findAllCustomPhrases();

      return next();
    }
  );

  router.get(
    '/custom-phrases/:languageKey',
    koaGuard({
      // Next up: guard languageKey by enum LanguageKey (that will be provided by @sijie later.)
      params: CustomPhrases.createGuard.pick({ languageKey: true }),
      response: CustomPhrases.guard,
    }),
    async (ctx, next) => {
      const {
        params: { languageKey },
      } = ctx.guard;

      ctx.body = await findCustomPhraseByLanguageKey(languageKey);

      return next();
    }
  );

  router.put(
    '/custom-phrases/:languageKey',
    koaGuard({
      params: CustomPhrases.createGuard.pick({ languageKey: true }),
      body: translationGuard,
      response: CustomPhrases.guard,
    }),
    async (ctx, next) => {
      const {
        params: { languageKey },
        body,
      } = ctx.guard;

      ctx.body = await upsertCustomPhrase({ languageKey, translation: body });

      return next();
    }
  );

  router.delete(
    '/custom-phrases/:languageKey',
    koaGuard({
      params: CustomPhrases.createGuard.pick({ languageKey: true }),
    }),
    async (ctx, next) => {
      const {
        params: { languageKey },
      } = ctx.guard;

      const {
        languageInfo: { fallbackLanguage },
      } = await findDefaultSignInExperience();

      if (fallbackLanguage === languageKey) {
        throw new RequestError({
          code: 'localization.cannot_delete_default_language',
          languageKey,
        });
      }

      await deleteCustomPhraseByLanguageKey(languageKey);
      ctx.status = 204;

      return next();
    }
  );
}
