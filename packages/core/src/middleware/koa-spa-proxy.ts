import fs from 'node:fs/promises';
import path from 'node:path';

import { trySafe } from '@silverhand/essentials';
import type { Context, MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import type { IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import serveStatic from '#src/middleware/koa-serve-static.js';
import type Queries from '#src/tenants/Queries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import serveCustomUiAssets from './koa-serve-custom-ui-assets.js';
import { getExperiencePackageWithFeatureFlagDetection } from './utils/experience-proxy.js';

type Properties = {
  readonly mountedApps: string[];
  readonly queries: Queries;
  readonly packagePath?: string;
  readonly port?: number;
  readonly prefix?: string;
};

const getDistributionPath = async <ContextT extends Context>(
  packagePath: string,
  ctx: ContextT
) => {
  if (packagePath === 'experience') {
    // Safely get the experience package name with feature flag detection, default fallback to legacy
    const moduleName =
      (await trySafe(async () => getExperiencePackageWithFeatureFlagDetection(ctx))) ??
      'experience-legacy';

    return path.join('node_modules/@logto', moduleName, 'dist');
  }

  return path.join('node_modules/@logto', packagePath, 'dist');
};

export default function koaSpaProxy<StateT, ContextT extends IRouterParamContext, ResponseBodyT>({
  mountedApps,
  packagePath = 'experience',
  port = 5001,
  prefix = '',
  queries,
}: Properties): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;

  const devProxy: Middleware = proxy('*', {
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

    const { customUiAssets } = await queries.signInExperiences.findDefaultSignInExperience();

    // If user has uploaded custom UI assets, serve them instead of native experience UI
    if (customUiAssets && packagePath === 'experience') {
      const serve = serveCustomUiAssets(customUiAssets.id);
      return serve(ctx, next);
    }

    if (!EnvSet.values.isProduction) {
      return devProxy(ctx, next);
    }

    const distributionPath = await getDistributionPath(packagePath, ctx);

    const spaDistributionFiles = await fs.readdir(distributionPath);

    if (!spaDistributionFiles.some((file) => requestPath.startsWith('/' + file))) {
      ctx.request.path = '/';
    }

    return serveStatic(distributionPath)(ctx, next);
  };
}
