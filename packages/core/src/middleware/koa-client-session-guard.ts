import fs from 'fs/promises';
import path from 'path';

import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';
import { Provider } from 'oidc-provider';

import { MountedApps } from '@/env-set';
import { fromRoot } from '@/env-set/parameters';

export const sessionNotFoundPath = '/unknown-session';

export default function koaSpaSessionGuard<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;
    const packagesPath = fromRoot ? 'packages/' : '..';
    const distPath = path.join(packagesPath, 'ui', 'dist');

    // Guard client routes only
    if (Object.values(MountedApps).some((app) => requestPath.startsWith(`/${app}`))) {
      return next();
    }

    try {
      // Find session
      await provider.interactionDetails(ctx.req, ctx.res);
    } catch {
      const spaDistFiles = await fs.readdir(distPath);

      if (
        !spaDistFiles.some((file) => requestPath.startsWith('/' + file)) &&
        !ctx.request.path.endsWith(sessionNotFoundPath) &&
        !ctx.request.URL.searchParams.get('preview') // Should not check session on preview mode
      ) {
        ctx.redirect(sessionNotFoundPath);
      }
    }

    return next();
  };
}
