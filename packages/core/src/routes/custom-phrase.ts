import { CustomPhrases, translationGuard } from '@logto/schemas';

import koaGuard from '@/middleware/koa-guard';
import {
  deleteCustomPhraseByLanguageKey,
  findCustomPhraseByLanguageKey,
  upsertCustomPhrase,
} from '@/queries/custom-phrase';

import { AuthedRouter } from './types';

export default function customPhraseRoutes<T extends AuthedRouter>(router: T) {
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

      await deleteCustomPhraseByLanguageKey(languageKey);
      ctx.status = 204;

      return next();
    }
  );
}
