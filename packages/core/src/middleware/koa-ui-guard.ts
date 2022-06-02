import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';
import { Provider } from 'oidc-provider';

import { MountedApps } from '@/env-set';
import { hasAdminUsers } from '@/queries/user';

// Need To Align With UI
export const sessionNotFoundPath = '/unknown-session';
export const guardedPath = ['/sign-in', '/register', '/social/register'];

export default function koaUiGuard<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  provider: Provider
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Session guard
    const isPreview = ctx.request.URL.searchParams.get('preview');
    const isSessionRequiredPath = guardedPath.some((path) => requestPath.startsWith(path));

    if (!isSessionRequiredPath || isPreview) {
      return next();
    }

    try {
      const { params } = await provider.interactionDetails(ctx.req, ctx.res);

      // Redirect to admin register if no admin users
      if (params.client_id === adminConsoleApplicationId && !(await hasAdminUsers())) {
        ctx.redirect(`/${MountedApps.Console}/register`);

        return;
      }

      // TODO: handle admin console sign-in
    } catch {
      ctx.redirect(sessionNotFoundPath);

      return;
    }

    return next();
  };
}
