import type { MiddlewareType } from 'koa';
import { errors } from 'oidc-provider';

/**
 * Turn provider router misses into an `InvalidRequest` JSON error. Before v9, oidc-provider
 * shipped a global catcher doing exactly this; since v9, unrecognized routes fall through the
 * koa-mount to the outer app, which renders a plain-text 404 — while every other provider error
 * response is JSON.
 *
 * Register after every other provider middleware so `Provider.use()` splices it directly around
 * the internal router, where `ctx.path` is still the mount-relative path the error message
 * carries.
 */
export default function koaOidcUnrecognizedRoute<StateT, ContextT>(): MiddlewareType<
  StateT,
  ContextT
> {
  return async (ctx, next) => {
    await next();

    if (ctx.status === 404 && ctx.message === 'Not Found') {
      throw new errors.InvalidRequest(
        `unrecognized route or not allowed method (${ctx.method} on ${ctx.path})`,
        404
      );
    }
  };
}
