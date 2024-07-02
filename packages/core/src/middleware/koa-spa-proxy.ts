import fs from 'node:fs/promises';
import path from 'node:path';

import type { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import type { IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import serveStatic from '#src/middleware/koa-serve-static.js';

export default function koaSpaProxy<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  mountedApps: string[],
  packagePath = 'experience',
  // OGCIO - formsie port collision fixed
  port = 7001,
  prefix = ''
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;

  const distributionPath = path.join('node_modules/@logto', packagePath, 'dist');

  const spaProxy: Middleware = EnvSet.values.isProduction
    ? serveStatic(distributionPath)
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

    // Skip if the request is for another app
    if (!prefix && mountedApps.some((app) => app !== prefix && requestPath.startsWith(`/${app}`))) {
      return next();
    }

    if (!EnvSet.values.isProduction) {
      return spaProxy(ctx, next);
    }

    const spaDistributionFiles = await fs.readdir(distributionPath);

    if (!spaDistributionFiles.some((file) => requestPath.startsWith('/' + file))) {
      ctx.request.path = '/';
    }

    return spaProxy(ctx, next);
  };
}
