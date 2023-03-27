import type { MiddlewareType } from 'koa';
import helmet from 'koa-helmet';
import type { IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';

export default function koaCspHeaders<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  mountedApps: string[]
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;
  const { isProduction, isCloud, adminUrlSet, cloudUrlSet } = EnvSet.values;

  const adminOrigins = adminUrlSet.deduplicated().map((location) => location.origin);
  const cloudOrigins = isCloud ? cloudUrlSet.deduplicated().map((location) => location.origin) : [];
  const developmentOrigins = isProduction ? [] : ['ws:'];

  const cspHeadersMiddleware: Middleware = helmet.contentSecurityPolicy({
    useDefaults: true,
    reportOnly: true,
    directives: {
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...adminOrigins, ...cloudOrigins, ...developmentOrigins],
      frameSrc: ["'self'", 'https:'], // TODO: open for external terms of use links
      frameAncestors: ["'self'", ...adminOrigins, ...cloudOrigins],
    },
  });

  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Route has been handled by one of mounted apps
    if (mountedApps.some((app) => app !== '' && requestPath.startsWith(`/${app}`))) {
      return next();
    }

    return cspHeadersMiddleware(ctx, next);
  };
}
