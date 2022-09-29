import resource from '@logto/phrases-ui';
import { CustomPhrases, Translation, translationGuard } from '@logto/schemas';
import cleanDeep from 'clean-deep';

import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import {
  deleteCustomPhraseByLanguageKey,
  findAllCustomPhrases,
  findCustomPhraseByLanguageKey,
  upsertCustomPhrase,
} from '@/queries/custom-phrase';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import assertThat from '@/utils/assert-that';
import { isValidStructure } from '@/utils/translation';

import { AuthedRouter } from './types';

const cleanDeepTranslation = (translation: Translation) =>
  // Since `Translation` type actually equals `Partial<Translation>`, force to cast it back to `Translation`.
  // eslint-disable-next-line no-restricted-syntax
  cleanDeep(translation) as Translation;

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

      const translation = cleanDeepTranslation(body);

      assertThat(
        isValidStructure(resource.en.translation, translation),
        new RequestError('localization.invalid_translation_structure')
      );

      ctx.body = await upsertCustomPhrase({ languageKey, translation });

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
