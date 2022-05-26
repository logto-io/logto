import fs from 'fs/promises';
import path from 'path';

import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';
import { Provider } from 'oidc-provider';

import { MountedApps } from '@/env-set';
import { fromRoot } from '@/env-set/parameters';

// Need To Align With UI
export const sessionNotFoundPath = '/unknown-session';
export const callbackPath = '/callback';

export const exceptionPaths = [sessionNotFoundPath, callbackPath];

export default function koaSpaSessionGuard<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;
    const packagesPath = fromRoot ? 'packages/' : '..';
    const clientPath = path.join(packagesPath, 'ui', 'dist');

    // Empty path Redirect
    if (requestPath === '/') {
      ctx.redirect(`/${MountedApps.Console}`);

      return next();
    }

    const spaDistFiles = await fs.readdir(clientPath);

    if (
      // Exclude MountedApps
      Object.values(MountedApps).some((app) => requestPath.startsWith(`/${app}`)) ||
      // Exclude static page routes
      exceptionPaths.some((path) => requestPath.startsWith(path)) ||
      // Exclude preview mode
      ctx.request.URL.searchParams.get('preview') ||
      // Exclude static files
      spaDistFiles.some((file) => requestPath.startsWith('/' + file))
    ) {
      return next();
    }

    // Check Session for client routes
    try {
      await provider.interactionDetails(ctx.req, ctx.res);
    } catch {
      ctx.redirect(sessionNotFoundPath);
    }

    return next();
  };
}
