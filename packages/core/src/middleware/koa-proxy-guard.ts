import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';
import { Provider } from 'oidc-provider';

import { MountedApps } from '@/env-set';

// Need To Align With UI
export const sessionNotFoundPath = '/unknown-session';
export const guardedPath = ['/sign-in', '/register', '/social-register'];

export default function koaSpaSessionGuard<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Empty path Redirect
    if (requestPath === '/') {
      ctx.redirect(`/${MountedApps.Console}`);

      return next();
    }

    // Session guard
    if (
      guardedPath.some((path) => requestPath.startsWith(path)) &&
      !ctx.request.URL.searchParams.get('preview')
    ) {
      try {
        await provider.interactionDetails(ctx.req, ctx.res);
      } catch {
        ctx.redirect(sessionNotFoundPath);
      }
    }

    return next();
  };
}
