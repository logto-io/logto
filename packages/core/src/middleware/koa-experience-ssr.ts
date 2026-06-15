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
    .replaceAll('&', '\\u0026')
    // U+2028 (LINE SEPARATOR) and U+2029 (PARAGRAPH SEPARATOR) are valid inside JSON strings but are
    // line terminators in a JavaScript string literal (pre-ES2019). Since this payload is embedded as a
    // JS expression (`Object.freeze(...)`), leaving them literal can break parsing in older engines.
    // Escape to their `\uXXXX` form, which JS decodes back to the original characters.
    .replaceAll('\u2028', '\\u2028') // U+2028 LINE SEPARATOR
    .replaceAll('\u2029', '\\u2029'); // U+2029 PARAGRAPH SEPARATOR

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

    // Inline custom CSS into <head> on the first byte so it is in the cascade for the first paint,
    // removing the flash before react-helmet injects the same <style> client-side. Done BEFORE the SSR
    // placeholder substitution so the `</head>` match can only hit the genuine document head. Skipped in
    // preview mode (`?preview=true`), where the console iframe drives styling live via postMessage and
    // inlining the *saved* CSS could leak rules being edited. `</style` is defused so admin CSS can't
    // terminate the element early (parser sees `<\/style`; the CSS engine unescapes `\/`→`/`). See PR #8917.
    const { customCss } = signInExperience;

    // Koa parses repeated query keys into an array, so `?preview=true&preview=x` yields `['true', 'x']`.
    // Normalize before comparing — a bare `!== 'true'` check would treat the array as non-preview and
    // inline the saved CSS during a preview load, the exact leak the preview branch is meant to prevent.
    const isPreview = [ctx.query.preview].flat().includes('true');

    const htmlWithCss =
      customCss && !isPreview
        ? ctx.body.replace(
            '</head>',
            // Use a replacement *function* so `$`-sequences (`$$`/`$&`/`` $` ``/`$'`) in admin CSS are
            // inserted verbatim. As a string replacement, `$'` would expand to the document tail after
            // the `</head>` match and corrupt the stylesheet instead of being treated as literal CSS.
            () =>
              `<style data-custom-css>${customCss.replaceAll(/<\/(style)/gi, '<\\/$1')}</style></head>`
          )
        : ctx.body;

    // Use a replacement *function* so any `$`-sequence in the serialized data is inserted verbatim. As a
    // string replacement, `$'` would expand to the document text after the placeholder and re-inject an
    // unescaped `</script>` — defeating the HTML-delimiter escaping in `serializeSsrData`.
    ctx.body = htmlWithCss.replace(
      ssrPlaceholder,
      () =>
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
