import fs from 'node:fs/promises';
import path from 'node:path';

import type { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import type { IRouterParamContext } from 'koa-router';

import { EnvSet, UserApps } from '#src/env-set/index.js';
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

/**
 * The path (relative to the mount prefix) at which the account center runtime config is served.
 * The account center's index.html loads this script so that `window.__logtoConfig__` is
 * populated before any React code runs — in both development (proxy) and production (static) mode.
 */
const runtimeConfigPath = '/runtime-config.js';

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
          return '/' + path.join(prefix, requestPath);
        },
      });

  return async (ctx, next) => {
    const requestPath = ctx.request.path;
    // Skip if the request is for another app
    if (!prefix && mountedApps.some((app) => app !== prefix && requestPath.startsWith(`/${app}`))) {
      return next();
    }

    // Serve the runtime config as a JS file for account center and experience SPA. Intercepted
    // before the proxy or static file server so it works in both development and production.
    // The script sets `window.__logtoConfig__` with server-side env vars at request time.
    if (
      (packagePath === UserApps.AccountCenter || packagePath === 'experience') &&
      requestPath === runtimeConfigPath
    ) {
      const config: Record<string, string> = {};
      const defaultPhoneCountryCode = process.env.LOGTO_DEFAULT_PHONE_COUNTRY_CODE;
      if (defaultPhoneCountryCode) {
        config.defaultPhoneCountryCode = defaultPhoneCountryCode;
      }
      ctx.type = 'application/javascript';
      ctx.body = `window.__logtoConfig__=${JSON.stringify(config)};` as unknown as ResponseBodyT;
      ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return;
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
