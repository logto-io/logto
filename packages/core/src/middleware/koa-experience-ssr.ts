import { type SsrData, logtoCookieKey, logtoUiCookieGuard, ssrPlaceholder } from '@logto/schemas';
import { pick, trySafe } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { getExperienceLanguage } from '#src/utils/i18n.js';

import { type WithI18nContext } from './koa-i18next.js';
import { isIndexPath } from './koa-serve-static.js';

/**
 * Create a middleware to prefetch the experience data and inject it into the HTML response. Some
 * conditions must be met:
 *
 * - The response body should be a string after the middleware chain (calling `next()`).
 * - The request path should be an index path.
 * - The SSR placeholder string ({@link ssrPlaceholder}) should be present in the response body.
 *
 * Otherwise, the middleware will do nothing.
 */
export default function koaExperienceSsr<StateT, ContextT extends WithI18nContext>(
  libraries: Libraries,
  queries: Queries
): MiddlewareType<StateT, ContextT> {
  return async (ctx, next) => {
    await next();

    if (
      !(typeof ctx.body === 'string' && isIndexPath(ctx.path)) ||
      !ctx.body.includes(ssrPlaceholder)
    ) {
      return;
    }

    const logtoUiCookie =
      trySafe(() =>
        logtoUiCookieGuard.parse(JSON.parse(ctx.cookies.get(logtoCookieKey) ?? '{}'))
      ) ?? {};

    const [signInExperience, customLanguages] = await Promise.all([
      libraries.signInExperiences.getFullSignInExperience({
        locale: ctx.locale,
        ...logtoUiCookie,
      }),
      queries.customPhrases.findAllCustomLanguageTags(),
    ]);
    const language = getExperienceLanguage({
      ctx,
      languageInfo: signInExperience.languageInfo,
      customLanguages,
    });
    const phrases = await libraries.phrases.getPhrases(language);

    ctx.set('Content-Language', language);
    ctx.body = ctx.body.replace(
      ssrPlaceholder,
      `Object.freeze(${JSON.stringify({
        signInExperience: {
          ...pick(logtoUiCookie, 'appId', 'organizationId'),
          data: signInExperience,
        },
        phrases: { lng: language, data: phrases },
      } satisfies SsrData)})`
    );
  };
}
