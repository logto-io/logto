import fs from 'fs/promises';
import path from 'path/posix';

import { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import { IRouterParamContext } from 'koa-router';
import serveStatic from 'koa-static';

import { isProduction, MountedApps } from '@/env/consts';

export default function koaSpaProxy<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  packagePath = 'ui',
  port = 5001,
  prefix = ''
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;

  const distPath = path.join('..', packagePath, 'dist');

  const uiProxy: Middleware = isProduction
    ? serveStatic(distPath)
    : proxy('*', {
        target: `http://localhost:${port}`,
        changeOrigin: true,
        logs: true,
        rewrite: (requestPath) => {
          // Static files
          if (requestPath.includes('.')) {
            return '/' + path.join(prefix, requestPath);
          }

          // In-app routes
          return requestPath;
        },
      });

  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Route has been handled by one of mounted apps
    if (
      Object.keys(MountedApps).some((app) => app !== prefix && requestPath.startsWith(`/${app}`))
    ) {
      return next();
    }

    if (!isProduction) {
      return uiProxy(ctx, next);
    }

    const uiDistFiles = await fs.readdir(distPath);

    if (!uiDistFiles.some((file) => requestPath.startsWith('/' + path.join(prefix, file)))) {
      ctx.request.path = '/';
    }

    return uiProxy(ctx, next);
  };
}
