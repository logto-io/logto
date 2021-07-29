import fs from 'fs';
import { Middleware } from 'koa';
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
>(): Middleware<StateT, ContextT, ResponseBodyT> {
  const developmentProxy = proxy('*', {
    target: 'http://localhost:5000',
    changeOrigin: true,
    logs: true,
  });
  const staticProxy = serveStatic(PATH_TO_UI_DIST);

  return async (context, next) => {
    // Route has been handled by one of mounted apps
    if (mountedApps.some((app) => context.request.path.startsWith(`/${app}`))) {
      return next();
    }

    if (!isProduction) {
      await developmentProxy(context, next);
      return next();
    }

    if (!uiDistFiles.some((file) => context.request.path.startsWith(`/${file}`))) {
      context.request.path = '/';
    }

    await staticProxy(context, next);
    return next();
  };
}
