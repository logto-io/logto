import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import type Queries from '../tenants/Queries.js';
import { getLogtoCookie } from '../utils/cookie.js';
import { getExperienceLanguage } from '../utils/i18n.js';

type EmailI18nContext = {
  /**
   * The resolved locale for email templates, synced with the language used in Experience UI.
   * E.g. "fr", "en". The value is determined by the following sources in order of priority:
   * - The `ui_locales` parameter from the authentication request, if any.
   * - The HTTP `Accept-Language` header, if the sign-in experience is configured to auto-detect language.
   * - The fallback language configured in the sign-in experience, defaults to `en`.
   */
  locale: string;
  /**
   * The original `ui_locales` parameter from the authentication request, if any. The value can
   * be a space-separated list of language tags, e.g. "fr-CA fr en". The first language tag that
   * matches the supported languages will be resolved as the `locale` above.
   */
  uiLocales?: string;
};

export type WithEmailI18nContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    emailI18n?: EmailI18nContext;
  };

/**
 * Middleware to add email i18n context to the Koa context. This middleware is used by both the experience routes
 * and the user routes (Account APIs).
 */
export default function koaEmailI18n<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  queries: Queries
): MiddlewareType<StateT, WithEmailI18nContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const {
      customPhrases: { findAllCustomLanguageTags },
      signInExperiences: { findDefaultSignInExperience },
    } = queries;

    const { uiLocales } = getLogtoCookie(ctx);
    const [customLanguages, { languageInfo }] = await Promise.all([
      findAllCustomLanguageTags(),
      findDefaultSignInExperience(),
    ]);
    const experienceLanguage = getExperienceLanguage({
      ctx,
      languageInfo,
      customLanguages,
      lng: uiLocales,
    });

    ctx.emailI18n = {
      locale: experienceLanguage,
      ...(uiLocales && { uiLocales }),
    };

    return next();
  };
}
