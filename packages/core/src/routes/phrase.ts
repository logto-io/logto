import resource from '@logto/phrases-ui';
import en from '@logto/phrases-ui/lib/locales/en';
import { CustomPhrases, Translation } from '@logto/schemas';
import { adminConsoleApplicationId, adminConsoleSignInExperience } from '@logto/schemas/lib/seeds';
import { LanguageKey, languageKeyGuard } from '@logto/shared';
import { notFalsy } from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import { ResourceLanguage } from 'i18next';
import { errors, Provider } from 'oidc-provider';

import detectLanguage from '@/i18n/detect-language';
import koaGuard from '@/middleware/koa-guard';
import { findAllCustomLanguageKeys, findCustomPhraseByLanguageKey } from '@/queries/custom-phrase';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from './types';

const getLanguageInfo = async (applicationId: unknown) => {
  if (applicationId === adminConsoleApplicationId) {
    return adminConsoleSignInExperience.languageInfo;
  }

  const { languageInfo } = await findDefaultSignInExperience();

  return languageInfo;
};

const isLanguageKeyEnum = (key: string): key is LanguageKey =>
  languageKeyGuard.safeParse(key).success;

const isFullyTranslated = (fullTranslation: Translation, targetTranslation: Translation) => {
  const keys = Object.keys(fullTranslation);
  const targetKeys = new Set(Object.keys(targetTranslation));

  if (keys.length !== targetKeys.size) {
    return false;
  }

  if (!keys.every((key) => targetKeys.has(key) && notFalsy(targetTranslation[key]))) {
    return false;
  }

  for (const key of keys) {
    if (
      typeof fullTranslation[key] === 'object' &&
      // eslint-disable-next-line no-restricted-syntax
      !isFullyTranslated(fullTranslation[key] as Translation, targetTranslation[key] as Translation)
    ) {
      return false;
    }
  }

  return true;
};

const finalDefaultLanguage = 'en';
// Ensure the final default language phrase contains a built-in phrase (that means it must be fully translated).
assertThat(
  Object.keys(resource).includes(finalDefaultLanguage),
  new Error(`The final default language "${finalDefaultLanguage}" must contain a built-in phrase.`)
);

const getPhrase = async (
  languageKey: string,
  defaultLanguageKey = finalDefaultLanguage
): Promise<ResourceLanguage> => {
  const customLanguageKeys = await findAllCustomLanguageKeys();
  const hasCustomPhrase = customLanguageKeys.includes(languageKey);
  const hasBuiltInPhrase = Object.keys(resource).includes(languageKey);

  if (!hasCustomPhrase && !hasBuiltInPhrase) {
    return getPhrase(defaultLanguageKey);
  }

  if (!hasCustomPhrase && isLanguageKeyEnum(languageKey)) {
    return { languageKey, ...resource[languageKey] };
  }

  const customPhrase = await findCustomPhraseByLanguageKey(languageKey);

  if (isFullyTranslated(en.translation, customPhrase.translation)) {
    return customPhrase;
  }

  if (hasBuiltInPhrase && isLanguageKeyEnum(languageKey)) {
    return deepmerge(resource[languageKey], customPhrase);
  }

  const defaultPhrase = await getPhrase(defaultLanguageKey);

  return deepmerge(defaultPhrase, customPhrase);
};

export default function phraseRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.get(
    '/phrase',
    koaGuard({
      response: CustomPhrases.guard,
    }),
    async (ctx, next) => {
      const interaction = await provider
        .interactionDetails(ctx.req, ctx.res)
        .catch((error: unknown) => {
          // Should not block if interaction is not found
          if (error instanceof errors.SessionNotFound) {
            return null;
          }

          throw error;
        });

      const applicationId = interaction?.params.client_id;
      const { autoDetect, fallbackLanguage: defaultLanguage } = await getLanguageInfo(
        applicationId
      );

      const supportedLanguages = new Set([
        ...Object.keys(resource),
        ...(await findAllCustomLanguageKeys()),
      ]);
      const detectedLanguage = autoDetect
        ? detectLanguage(ctx).find((languageKey) => supportedLanguages.has(languageKey)) ??
          defaultLanguage
        : defaultLanguage;
      ctx.body = await getPhrase(detectedLanguage, defaultLanguage);

      return next();
    }
  );
}
