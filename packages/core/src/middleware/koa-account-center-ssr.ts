import { trySafe } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import type Libraries from '#src/tenants/Libraries.js';

import { type WithI18nContext } from './koa-i18next.js';
import { isIndexPath } from './koa-serve-static.js';

/**
 * Placeholder for account center SSR data injection. The value should be kept in sync with
 * {@link file://./../../../account/index.html}.
 */
const accountCenterSsrPlaceholder = '"__LOGTO_ACCOUNT_CENTER_SSR__"';

/**
 * Create a middleware to prefetch sign-in experience color/theme data and inject it into the
 * account center HTML response for theme flash prevention.
 *
 * Conditions for injection:
 * - The response body should be a string after the middleware chain (calling `next()`).
 * - The request path should be an index path.
 * - The SSR placeholder string should be present in the response body.
 */
export default function koaAccountCenterSsr<StateT, ContextT extends WithI18nContext>(
  libraries: Libraries
): MiddlewareType<StateT, ContextT> {
  return async (ctx, next) => {
    await next();

    if (
      !(typeof ctx.body === 'string' && isIndexPath(ctx.path)) ||
      !ctx.body.includes(accountCenterSsrPlaceholder)
    ) {
      return;
    }

    const signInExperience = await trySafe(
      libraries.signInExperiences.getFullSignInExperience({ locale: ctx.locale })
    );

    if (!signInExperience) {
      return;
    }

    ctx.body = ctx.body.replace(
      accountCenterSsrPlaceholder,
      `Object.freeze(${JSON.stringify({
        signInExperience: { data: signInExperience },
      })})`
    );
  };
}
