import { type SsrData, logtoCookieKey, logtoUiCookieGuard, ssrPlaceholder } from '@logto/schemas';
import { pick, trySafe } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { getExperienceLanguage } from '#src/utils/i18n.js';

import { type WithI18nContext } from './koa-i18next.js';
import { isIndexPath } from './koa-serve-static.js';

/**
 * Serialize SSR data for safe embedding inside an inline `<script>`. `JSON.stringify` alone is unsafe:
 * a string such as `</script>` in the data (e.g. inside custom CSS or custom content) would close the
 * script element early and enable injection. Escaping the HTML-significant characters keeps the values
 * identical once parsed by JS, while preventing the HTML parser from recognizing any tag delimiters.
 */
const serializeSsrData = (data: SsrData): string =>
  JSON.stringify(data)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');

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
      lng: typeof ctx.query.lng === 'string' ? ctx.query.lng : undefined,
    });
    const phrases = await libraries.phrases.getPhrases(language);

    ctx.set('Content-Language', language);

    // Inline custom CSS into the served HTML <head> BEFORE substituting the SSR placeholder, so the
    // `</head>` match can only hit the genuine document head — never a `</head>` that might appear in
    // the injected SSR JSON. Having the CSS in <head> on the first byte puts it in the cascade for the
    // first paint, removing the flash where built-in styles render before react-helmet injects the
    // custom <style> a frame later. react-helmet still re-asserts the same CSS client-side (harmless)
    // and keeps live preview working.
    const { customCss } = signInExperience;

    // Inline the custom CSS only outside preview mode. In preview the console iframe drives styling live
    // via postMessage + react-helmet, so inlining the *saved* CSS here could briefly show it and even
    // leak rules the user is editing out — live preview has no FOUC to fix. `</style` is defused so admin
    // CSS can't terminate the element early (the HTML parser sees `<\/style`; the CSS engine unescapes
    // `\/`→`/`). The `</head>` replace is a no-op if absent, falling back to client-side helmet injection.
    const htmlWithCss =
      customCss && ctx.query.preview !== 'true'
        ? ctx.body.replace(
            '</head>',
            `<style data-custom-css>${customCss.replaceAll(/<\/(style)/gi, '<\\/$1')}</style></head>`
          )
        : ctx.body;

    ctx.body = htmlWithCss.replace(
      ssrPlaceholder,
      `Object.freeze(${serializeSsrData({
        signInExperience: {
          ...pick(logtoUiCookie, 'appId', 'organizationId'),
          data: signInExperience,
        },
        phrases: { lng: language, data: phrases },
      })})`
    );
  };
}
