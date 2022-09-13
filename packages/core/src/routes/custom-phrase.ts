import { CustomPhrases } from '@logto/schemas';

import koaGuard from '@/middleware/koa-guard';
import { findCustomPhraseByLanguageKey } from '@/queries/custom-phrase';

import { AuthedRouter } from './types';

export default function phraseRoutes<T extends AuthedRouter>(router: T) {
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
}
