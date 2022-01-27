import fs from 'fs/promises';

import { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import { IRouterParamContext } from 'koa-router';
import serveStatic from 'koa-static';

import { isProduction, mountedApps } from '@/env/consts';

const PATH_TO_UI_DIST = '../ui/build/public';

export default function koaUIProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;

  const uiProxy: Middleware = isProduction
    ? serveStatic(PATH_TO_UI_DIST)
    : proxy('*', {
        target: 'http://localhost:5001',
        changeOrigin: true,
        logs: true,
      });

  return async (ctx, next) => {
    // Route has been handled by one of mounted apps
    if (mountedApps.some((app) => ctx.request.path.startsWith(`/${app}`))) {
      return next();
    }

    if (!isProduction) {
      return uiProxy(ctx, next);
    }

    const uiDistFiles = await fs.readdir(PATH_TO_UI_DIST);

    if (!uiDistFiles.some((file) => ctx.request.path.startsWith(`/${file}`))) {
      ctx.request.path = '/';
    }

    return uiProxy(ctx, next);
  };
}
