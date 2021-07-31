import fs from 'fs';
import { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import serveStatic from 'koa-static';
import { IRouterParamContext } from 'koa-router';
import { isProduction, mountedApps } from '@/consts';

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

  return async (context, next) => {
    // Route has been handled by one of mounted apps
    if (mountedApps.some((app) => context.request.path.startsWith(`/${app}`))) {
      return next();
    }

    if (!isProduction) {
      return developmentProxy(context, next);
    }

    if (!uiDistFiles.some((file) => context.request.path.startsWith(`/${file}`))) {
      context.request.path = '/';
    }

    return staticProxy(context, next);
  };
}
