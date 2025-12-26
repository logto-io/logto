import fs from 'node:fs/promises';
import path from 'node:path';

import type { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import type { IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import serveStatic from '#src/middleware/koa-serve-static.js';
import type Queries from '#src/tenants/Queries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import serveCustomUiAssets from './koa-serve-custom-ui-assets.js';

type Properties = {
  readonly mountedApps: string[];
  readonly queries: Queries;
  readonly packagePath?: string;
  readonly port?: number;
  readonly prefix?: string;
};

export default function koaSpaProxy<StateT, ContextT extends IRouterParamContext, ResponseBodyT>({
  mountedApps,
  packagePath = 'experience',
  port = 5001,
  prefix = '',
  queries,
}: Properties): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;

  const distributionPath = path.join('node_modules/@logto', packagePath, 'dist');

  const spaProxy: Middleware = EnvSet.values.isProduction
    ? serveStatic(distributionPath)
    : proxy('*', {
        target: `http://localhost:${port}`,
        changeOrigin: true,
        logs: (ctx, target) => {
          // Ignoring static file requests in development since vite will load a crazy amount of files
          if (path.basename(ctx.request.path).includes('.')) {
            return;
          }
          getConsoleLogFromContext(ctx).plain(`\tproxy --> ${target}`);
        },
        rewrite: (requestPath) => {
          // `rewrite` is for URLs, so we must use POSIX separators and avoid Windows absolute-path
          // semantics (e.g. `path.join('console', '/@fs/...')` would drop the prefix on win32).
          const normalized = requestPath.replace(/^\/+/, '');
          const joined = prefix ? path.posix.join(prefix, normalized) : normalized;
          return '/' + joined;
        },
      });

  return async (ctx, next) => {
    const requestPath = ctx.request.path;
    // Skip if the request is for another app
    if (!prefix && mountedApps.some((app) => app !== prefix && requestPath.startsWith(`/${app}`))) {
      return next();
    }
    const { customUiAssets } = await queries.signInExperiences.findDefaultSignInExperience();
    // If user has uploaded custom UI assets, serve them instead of native experience UI
    if (customUiAssets && packagePath === 'experience') {
      const serve = serveCustomUiAssets(customUiAssets.id);
      return serve(ctx, next);
    }

    if (!EnvSet.values.isProduction) {
      return spaProxy(ctx, next);
    }

    const spaDistributionFiles = await fs.readdir(distributionPath);

    // Fall back to root if the request is not for a SPA distribution file
    // We should exclude the `/assets` folder here since it should return 404 if the file is not
    // found
    if (
      !requestPath.startsWith('/assets/') &&
      !spaDistributionFiles.some((file) => requestPath.startsWith('/' + file))
    ) {
      ctx.request.path = '/';
    }

    // Add a header to indicate which static package is being served
    ctx.set('Logto-Static-Package', packagePath);

    return spaProxy(ctx, next);
  };
}
