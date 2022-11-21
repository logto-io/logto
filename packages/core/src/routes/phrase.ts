import { isBuiltInLanguageTag } from '@logto/phrases-ui';
import {
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
} from '@logto/schemas/lib/seeds/index.js';
import type { Provider } from 'oidc-provider';

import detectLanguage from '#src/i18n/detect-language.js';
import { getPhrase } from '#src/lib/phrase.js';
import { findAllCustomLanguageTags } from '#src/queries/custom-phrase.js';
import { findDefaultSignInExperience } from '#src/queries/sign-in-experience.js';

import type { AnonymousRouter } from './types.js';

const getLanguageInfo = async (applicationId: unknown) => {
  if (applicationId === adminConsoleApplicationId) {
    return adminConsoleSignInExperience.languageInfo;
  }

  const { languageInfo } = await findDefaultSignInExperience();

  return languageInfo;
};

export default function phraseRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
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
    ctx.body = await getPhrase(language, customLanguages);

    return next();
  });
}
