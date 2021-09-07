import fs from 'fs';

import { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import { IRouterParamContext } from 'koa-router';
import serveStatic from 'koa-static';

import { isProduction, mountedApps } from '@/env/consts';

const PATH_TO_UI_DIST = '../ui/build/public';
const uiDistFiles = fs.readdirSync(PATH_TO_UI_DIST);

export default function koaUIProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;

  const developmentProxy: Middleware = proxy('*', {
    target: 'http://localhost:5000',
    changeOrigin: true,
    logs: true,
  });
  const staticProxy: Middleware = serveStatic(PATH_TO_UI_DIST);

  return async (ctx, next) => {
    // Route has been handled by one of mounted apps
    if (mountedApps.some((app) => ctx.request.path.startsWith(`/${app}`))) {
      return next();
    }

    if (!isProduction) {
      return developmentProxy(ctx, next);
    }

    if (!uiDistFiles.some((file) => ctx.request.path.startsWith(`/${file}`))) {
      ctx.request.path = '/';
    }

    return staticProxy(ctx, next);
  };
}
